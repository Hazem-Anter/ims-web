
using IMS.Api.Auth;
using IMS.Api.Middleware;
using IMS.Application;
using IMS.Application.Abstractions.Auth;
using IMS.Infrastructure;
using IMS.Infrastructure.Identity;
using IMS.Infrastructure.Persistence;
using IMS.Infrastructure.Persistence.Seeding;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;

namespace IMS.Api
{
    public class Program
    {
        // Entry point for the application.
        // Async because we are awaiting asynchronous operations during startup.
        // asynchronous like database seeding
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // --------------------------------------------
            // Controllers: Require auth globally by default
            // --------------------------------------------


            // AddControllers with a global authorization filter. 
            // This ensures that all endpoints require authentication by default,
            // and we can override this behavior on specific controllers or actions if needed.
            builder.Services.AddControllers(options =>
            {
                var policy = new AuthorizationPolicyBuilder()        // Create a new authorization policy that requires authenticated users.
                    .RequireAuthenticatedUser()                      // This method adds a requirement to the policy that the user must be authenticated.
                    .Build();                                        // Build the policy, which compiles all the requirements into a single policy object.
                options.Filters.Add(new AuthorizeFilter(policy));    // Add the authorization filter to the MVC options, which applies the policy globally to all controllers and actions.
            });

            //Swagger/OpenAPI

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();

            // Configure Swagger to include JWT authentication support.
            // This allows us to test authenticated endpoints directly from the Swagger UI by providing a JWT token.
            builder.Services.AddSwaggerGen(c =>
            {
                // 1) Define the Swagger document with a title and version.
                // This is the basic information about our API that will be displayed in the Swagger UI.
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "IMS API",
                    Version = "v1"
                });

                // 2) Add a security definition for Bearer authentication.
                // This tells Swagger that our API uses JWT Bearer tokens for authentication and how to provide them in the UI.
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter your JWT token like: Bearer {token}"
                });

                // 3) Add a security requirement that applies the Bearer authentication scheme to all endpoints.
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });

                c.OperationFilter<Swagger.SetupKeyHeaderOperationFilter>();

            });

            // Layers
            builder.Services.AddInfrastructureServices(builder.Configuration);
            builder.Services.AddApplicationService();

            // Time provider (test-friendly)

            // Register TimeProvider as a singleton service in the dependency injection container.
            // This allows us to inject TimeProvider into other services or controllers that require time-related functionality.
            // solve the problem of time management in the application.
            builder.Services.AddSingleton(TimeProvider.System);

            // Cache (used in token validation hook to reduce DB hits)
            builder.Services.AddMemoryCache();

            // Authorization policies
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy(Policies.AdminOnly,
                    p => p.RequireRole("Admin"));

                options.AddPolicy(Policies.UserManagement,
                    p => p.RequireRole("Admin"));

                options.AddPolicy(Policies.InventoryRead,
                    p => p.RequireRole("Admin", "Manager", "Clerk", "Auditor"));

                options.AddPolicy(Policies.InventoryWrite,
                    p => p.RequireRole("Admin", "Manager", "Clerk"));

                options.AddPolicy(Policies.ReportsRead,
                    p => p.RequireRole("Admin", "Manager", "Auditor"));

                options.AddPolicy(Policies.DashboardRead,
                    p => p.RequireRole("Admin", "Manager", "Auditor"));
            });


            // --------------------------------------------
            // Health checks (ready = DB reachable)
            // --------------------------------------------

            // Configure Health Checks for SQL Server databases
            // This section adds health checks to the application to monitor the health of the SQL Server databases used by the application.
            builder.Services.AddHealthChecks()
                .AddSqlServer(
                    connectionString: builder.Configuration.GetConnectionString("ImsConnection")!,
                    name: "ims-db",
                    tags: new[] { "ready" })
                .AddSqlServer(
                    connectionString: builder.Configuration.GetConnectionString("AuthConnection")!,
                    name: "auth-db",
                    tags: new[] { "ready" });

            // --------------------------------------------
            // JWT Authentication
            // --------------------------------------------

            // ##########################################################################################
            // Configure JWT Authentication  
            // This section sets up JWT authentication for the application.
            // It reads JWT configuration from the appsettings.json file,
            // validates incoming JWT tokens, and ensures that only authenticated users can access protected endpoints.
            var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()
                        ?? throw new InvalidOperationException("Jwt configuration is missing.");


            // Configure the authentication services to use JWT Bearer tokens.
            builder.Services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,

                        ValidIssuer = jwt.Issuer,
                        ValidAudience = jwt.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwt.Secret)),

                        ClockSkew = TimeSpan.FromSeconds(30)
                    };

                    // Add custom event handlers for JWT token validation.
                    // This allows us to perform additional checks when a token is validated
                    options.Events = new JwtBearerEvents
                    {
                        // OnTokenValidated is called after the token has been validated by the default JWT validation logic.
                        OnTokenValidated = async context =>
                        {
                            // 1) Retrieve the UserManager service from the dependency injection container to access user information.
                            var userManager = context.HttpContext.RequestServices
                                .GetRequiredService<UserManager<ApplicationUser>>();

                            // 2) Extract the user ID from the token's claims.
                            // If the user ID is missing or invalid, fail the authentication.
                            var userId = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                            if (string.IsNullOrWhiteSpace(userId))
                            {
                                context.Fail("Invalid token (missing user id).");
                                return;
                            }

                            // 3) Retrieve the user from the database using the UserManager.
                            var user = await userManager.FindByIdAsync(userId);
                            if (user is null)
                            {
                                context.Fail("User no longer exists.");
                                return;
                            }

                            // 4) Check if the user is locked out (deactivated).
                            // If the LockoutEnd property has a value and is in the future,
                            // it means the user is currently locked out, and we should fail the authentication.
                            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow)
                            {
                                context.Fail("User is deactivated.");
                                return;
                            }

                            // 5) Validate the security stamp to ensure the token is still valid.
                            var tokenStamp = context.Principal?.FindFirstValue("sstamp");
                            if (string.IsNullOrWhiteSpace(tokenStamp) || tokenStamp != user.SecurityStamp)
                            {
                                context.Fail("Token is no longer valid.");
                                return;
                            }
                        }
                    };

                });


            // ##########################################################################################


            // Register the global exception handling middleware as a transient service in the dependency injection container.
            builder.Services.AddTransient<GlobalExceptionMiddleware>();

            // Add CORS policy
            var allowedOrigins = builder.Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? [];

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Frontend", policy =>
                {
                    policy
                        .WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });


            var app = builder.Build();

            /*
            // Seed Identity data (roles and users)
            using (var scope = app.Services.CreateScope())
            {
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

                await IdentitySeeder.SeedAsync(roleManager, userManager, config);
            }
            */
            /*
            // Seed the database during development
            // This ensures that the database has initial data for testing and development purposes.
            if (app.Environment.IsDevelopment())
            {
                using var scope = app.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await AppDbSeeder.SeedAsync(db);
            }
            */

            // --------------------------------------------
            // Middleware pipeline
            // --------------------------------------------

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();

                // Nice dev UX: open swagger from root
                app.MapGet("/", () => Results.Redirect("/swagger"))
                   .ExcludeFromDescription();
            }

            // Add the global exception handling middleware to the request pipeline.
            app.UseMiddleware<GlobalExceptionMiddleware>();

            //app.UseHttpsRedirection();
            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            // Use the configured CORS policy to allow cross-origin requests from the frontend application.
            app.UseCors("Frontend");


            app.UseAuthentication();
            app.UseAuthorization();


            // --------------------------------------------
            // Startup: Auto-migrate with retry (BEFORE endpoints)
            // --------------------------------------------

            // Run database migrations on startup if the configuration setting "Database:AutoMigrate" is set to true.
            // This ensures that the database schema is automatically updated to match the latest migrations when the application starts.
            if (app.Configuration.GetValue<bool>("Database:AutoMigrate"))
            {
                // 1) Define the maximum number of migration attempts and the delay between attempts.
                const int maxAttempts = 10;
                const int delaySeconds = 3;

                // 2) Create a new scope to access the required services for database migration,
                // such as the DbContexts and logger.
                using var scope = app.Services.CreateScope();
                var logger = scope.ServiceProvider
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("DatabaseMigration");

                // 3) Attempt to run the database migrations with retry logic.
                for (int attempt = 1; attempt <= maxAttempts; attempt++)
                {
                    try
                    {
                        // a- Log the start of the migration attempt.
                        logger.LogInformation("Running database migrations (attempt {Attempt}/{Max})", attempt, maxAttempts);

                        // b- Retrieve the AppDbContext and AuthDbContext from the service provider and run the migrations asynchronously.
                        var imsDb = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        await imsDb.Database.MigrateAsync();

                        var authDb = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
                        await authDb.Database.MigrateAsync();

                        // c- If the migrations succeed, log a success message and break out of the retry loop.
                        logger.LogInformation("Database migrations completed successfully.");
                        break;
                    }
                    catch (Exception ex)
                    {
                        // a- If an exception occurs during migration, log a warning message with the exception details and the current attempt number.
                        logger.LogWarning(ex,
                            "Database migration attempt {Attempt} failed. Retrying in {Delay}s...",
                            attempt, delaySeconds);

                        // b- If the maximum number of attempts has been reached, rethrow the exception to prevent the application from starting with an inconsistent database state.
                        if (attempt == maxAttempts)
                            throw;

                        // c- Wait for a specified delay before retrying the migration. This helps to handle transient issues such as temporary database connectivity problems.
                        await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
                    }
                }

            }

            // --------------------------------------------
            // Health endpoints
            // --------------------------------------------

            // Configure health check endpoints for liveness and readiness probes.
            app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
            {
                Predicate = _ => false // liveness: app is running
            });

            app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
            {
                Predicate = r => r.Tags.Contains("ready") // readiness: DB checks
            });

            // Controllers
            app.MapControllers();

            await app.RunAsync();
        }
    }
}

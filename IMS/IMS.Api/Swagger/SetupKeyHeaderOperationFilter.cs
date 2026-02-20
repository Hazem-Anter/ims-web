using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace IMS.Api.Swagger
{
    public sealed class SetupKeyHeaderOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Look for parameters bound from header with name "X-Setup-Key"
            var hasSetupKeyHeader = context.MethodInfo
                .GetParameters()
                .Any(p =>
                    p.GetCustomAttributes(typeof(FromHeaderAttribute), inherit: true)
                     .OfType<FromHeaderAttribute>()
                     .Any(a => string.Equals(a.Name, "X-Setup-Key", StringComparison.OrdinalIgnoreCase)));

            if (!hasSetupKeyHeader)
                return;

            operation.Parameters ??= new List<OpenApiParameter>();

            // Prevent duplicates
            if (operation.Parameters.Any(p => p.In == ParameterLocation.Header && p.Name == "X-Setup-Key"))
                return;

            operation.Parameters.Add(new OpenApiParameter
            {
                Name = "X-Setup-Key",
                In = ParameterLocation.Header,
                Required = true,
                Description = "Setup key required for initial system initialization.",
                Schema = new OpenApiSchema { Type = "string" }
            });
        }
    }
}

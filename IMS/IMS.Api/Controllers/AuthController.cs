using IMS.Api.Common;
using IMS.Application.Features.Auth.Login;
using IMS.Application.Features.Auth.Users.CreateUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace IMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
        {
            // 1) Validate the request (e.g., check if email and password are provided)
            var result = await _mediator.Send(new LoginCommand(req.Email, req.Password), ct);

            // 2) Return the appropriate response based on the result
            var data = result.OkOrThrow();

            return Ok(data);
        }


        // Endpoint to get the current user's information
        // This is a simple example and can be expanded to include more user details as needed
        // Note: This endpoint requires authentication, so the user must provide a valid JWT token in the Authorization header
        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            // 1) Extract user information from the JWT token claims
            // The "sub" claim typically contains the user ID,
            // but it can also be stored in other claims depending on how the token is generated.

            // User is a ControllerBase property that provides access to the claims of the authenticated user
            var sub =
                User.FindFirstValue(JwtRegisteredClaimNames.Sub)    
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 2) Validate the extracted information (e.g., check if the user ID is present and valid)
            if (!int.TryParse(sub, out var userId))
                return Unauthorized(new { error = "Invalid token (missing/invalid user id)." });

            // 3) Return the user information in the response
            var email =
                User.FindFirstValue(JwtRegisteredClaimNames.Email)
                ?? User.FindFirstValue(ClaimTypes.Email)
                ?? string.Empty;

            // 4) Extract roles from the claims (if needed)
            var roles = User.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .Distinct()
                .ToList();

            // 5) Return the user information in the response
            return Ok(new MeResponse(userId, email, roles));
        }

    }

    // Simple DTO for the /me endpoint response
    public sealed record MeResponse(int UserId, string Email, IReadOnlyList<string> Roles);

}

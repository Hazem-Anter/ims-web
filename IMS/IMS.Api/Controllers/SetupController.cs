using IMS.Api.Common;
using IMS.Application.Features.Setup.InitializeSystem;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SetupController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IConfiguration _config;

        public SetupController(IMediator mediator, IConfiguration config)
        {
            _mediator = mediator;
            _config = config;
        }

        // OPTIONAL: require a setup key for safety
        // Configure in appsettings or env:
        // Setup:Key = "some-strong-secret"
        [AllowAnonymous]
        [HttpPost("initialize")]
        public async Task<IActionResult> Initialize(
            [FromHeader(Name = "X-Setup-Key")] string? setupKeyHeader,
            [FromBody] InitializeSystemCommand command)
        {
            var setupKey = _config["Setup:Key"];    // DEV-SETUP-KEY-CHANGE-ME

            // If key is configured, require it
            if (!string.IsNullOrWhiteSpace(setupKey))
            {
                if (!string.Equals(setupKeyHeader, setupKey, StringComparison.Ordinal))
                    return Unauthorized("Invalid setup key.");
            }

            var result = ( await _mediator.Send(command) ).OkOrThrow();

            return Ok(result);
        }

    }
}


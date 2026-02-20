using IMS.Api.Auth;
using IMS.Api.Common;
using IMS.Application.Features.Dashboard.Queries.GetDashboardSummary;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.Api.Controllers
{
    [Authorize(Policy = Policies.DashboardRead)]
    [ApiController]
    [Route("api/dashboard")]
    public sealed class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(CancellationToken ct)
        {
            var result = await _mediator.Send(new GetDashboardSummaryQuery(), ct);
            return Ok(result.OkOrThrow());

            // the Dead Stock is fixed in the DashboardReadService in Infrastructure,
            // Passed into DeadStock method = 30 days, which is the default value for the dashboard summary query handler.
        }
    }
}

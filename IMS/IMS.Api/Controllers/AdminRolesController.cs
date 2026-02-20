using IMS.Api.Auth;
using IMS.Api.Common;
using IMS.Application.Features.Admin.Roles.Commands.CreateRole;
using IMS.Application.Features.Admin.Roles.Commands.DeleteRole;
using IMS.Application.Features.Admin.Roles.Queries.ListRoles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.Api.Controllers
{
    [ApiController]
    [Route("api/admin/roles")]
    [Authorize(Policy = Policies.AdminOnly)]
    public sealed class AdminRolesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AdminRolesController(IMediator mediator) => _mediator = mediator;

        // Get: /api/admin/roles
        [HttpGet]
        public async Task<IActionResult> List(CancellationToken ct)
        {
            var result = await _mediator.Send(new ListRolesQuery(), ct);
            return Ok(result.OkOrThrow());
        }

        // Post: /api/admin/roles
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoleRequest req, CancellationToken ct)
        {
            var result = await _mediator.Send(new CreateRoleCommand(req.RoleName), ct);
            result.OkOrThrow();
            return NoContent();
        }

        // Delete: /api/admin/roles/{roleName}
        [HttpDelete("{roleName}")]
        public async Task<IActionResult> Delete(string roleName, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteRoleCommand(roleName), ct);
            result.OkOrThrow();
            return NoContent();
        }

        public sealed record CreateRoleRequest(string RoleName);
    }
}

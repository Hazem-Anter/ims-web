using IMS.Api.Auth;
using IMS.Api.Common;
using IMS.Api.Contracts.Admin;
using IMS.Application.Features.Admin.Users.Commands.ActivateUser;
using IMS.Application.Features.Admin.Users.Commands.AssignRole;
using IMS.Application.Features.Admin.Users.Commands.ChangePassword;
using IMS.Application.Features.Admin.Users.Commands.DeactivateUser;
using IMS.Application.Features.Admin.Users.Commands.RemoveRole;
using IMS.Application.Features.Admin.Users.Queries.GetUser;
using IMS.Application.Features.Admin.Users.Queries.ListUsers;
using IMS.Application.Features.Auth.Users.CreateUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.Api.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Policy = Policies.UserManagement)]
    public sealed class AdminUsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AdminUsersController(IMediator mediator) => _mediator = mediator;

        // POST: api/admin/users
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest req, CancellationToken ct)
        {
            var result = await _mediator.Send(new CreateUserCommand(req.Email, req.Password, req.Roles), ct);
            return Ok(result.OkOrThrow());
        }

        // GET: api/admin/users?search=John&page=1&pageSize=20
        [HttpGet]
        public async Task<IActionResult> List(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new ListUsersQuery(search, page, pageSize), ct);
            return Ok(result.OkOrThrow());
        }

        // POST: api/admin/users
        [HttpPost("{userId:int}/roles/assign")]
        public async Task<IActionResult> AssignRole(int userId, [FromBody] RoleRequest req, CancellationToken ct)
        {
            var result = await _mediator.Send(new AssignRoleCommand(userId, req.Role), ct);

            return Ok(result.OkOrThrow());
        }

        // POST: api/admin/users/{userId}/roles/remove
        [HttpPost("{userId:int}/roles/remove")]
        public async Task<IActionResult> RemoveRole(int userId, [FromBody] RoleRequest req, CancellationToken ct)
        {
            var result = await _mediator.Send(new RemoveRoleCommand(userId, req.Role), ct);
            
            return Ok(result.OkOrThrow());
        }

        // POST: api/admin/users/{userId}/password/reset
        [HttpPost("{userId:int}/password/reset")]
        public async Task<IActionResult> ResetPassword(int userId, [FromBody] ResetPasswordRequest req, CancellationToken ct)
        {
            var result = await _mediator.Send(new ChangePasswordCommand(userId, req.NewPassword), ct);
            return Ok(result.OkOrThrow());
        }

        // PATCH: api/admin/users/{userId}/deactivate
        [HttpPatch("{userId:int}/deactivate")]
        public async Task<IActionResult> Deactivate(int userId, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeactivateUserCommand(userId), ct);

            return Ok(result.OkOrThrow());
        }

        // PATCH: api/admin/users/{userId}/activate
        [HttpPatch("{userId:int}/activate")]
        public async Task<IActionResult> Activate(int userId, CancellationToken ct)
        {
            var result = await _mediator.Send(new ActivateUserCommand(userId), ct);

            return Ok(result.OkOrThrow());
        }

        // GET: api/admin/users/{userId}
        [HttpGet("{userId:int}")]
        public async Task<IActionResult> Get(int userId, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetUserQuery(userId), ct);
            return Ok(result.OkOrThrow());
        }


    }
}

using IMS.Api.Auth;
using IMS.Api.Common;
using IMS.Api.Contracts.Inventory;
using IMS.Application.Features.Inventory.Commands.AdjustStock;
using IMS.Application.Features.Inventory.Commands.IssueStock;
using IMS.Application.Features.Inventory.Commands.ReceiveStock;
using IMS.Application.Features.Inventory.Commands.TransferStock;
using IMS.Application.Features.Inventory.Queries.StockOverview;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.Api.Controllers
{
    [Authorize(Policy = Policies.InventoryWrite)]
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public InventoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("receive")]
        public async Task<IActionResult> Receive([FromBody] ReceiveStockRequest request, CancellationToken ct)
        {
            // 1) Map ReceiveStockRequest to ReceiveStockCommand
            var cmd = new ReceiveStockCommand(
            request.ProductId,
            request.WarehouseId,
            request.LocationId,
            request.Quantity,
            request.UnitCost,
            request.ReferenceType,
            request.ReferenceId);

            // 2) Send the command to the mediator handler
            var result = await _mediator.Send(cmd, ct);

            // 3) Handle the result and return appropriate HTTP response
            var id = result.OkOrThrow();

            return Ok(new { transactionId = id });
        }

        [HttpPost("issue")]
        public async Task<IActionResult> Issue([FromBody] IssueStockRequest request, CancellationToken ct)
        {
            // 1) Map IssueStockRequest to IssueStockCommand
            var cmd = new IssueStockCommand(
            request.ProductId,
            request.WarehouseId,
            request.LocationId,
            request.Quantity,
            request.ReferenceType,
            request.ReferenceId);

            // 2) Send the command to the mediator handler
            var result = await _mediator.Send(cmd, ct);

            // 3) Handle the result and return appropriate HTTP response
            var id = result.OkOrThrow();

            return Ok(new { transactionId = id });
        }

        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer([FromBody] TransferStockRequest request, CancellationToken ct)
        {
            // 1) Map TransferStockRequest to TransferStockCommand
            var cmd = new TransferStockCommand(
            request.ProductId,
            request.FromWarehouseId,
            request.FromLocationId,
            request.ToWarehouseId,
            request.ToLocationId,
            request.Quantity,
            request.ReferenceType,
            request.ReferenceId);

            // 2) Send the command to the mediator handler
            var result = await _mediator.Send(cmd, ct);

            // 3) Handle the result and return appropriate HTTP response
            var id = result.OkOrThrow();

            return Ok(new { transactionId = id });
        }

        [HttpPost("adjust")]
        public async Task<IActionResult> Adjust([FromBody] AdjustStockRequest request, CancellationToken ct)
        {
            // 1) Map AdjustStockRequest to AdjustStockCommand
            var cmd = new AdjustStockCommand(
                request.ProductId,
                request.WarehouseId,
                request.LocationId,
                request.DeltaQuantity,
                request.Reason,
                request.ReferenceType,
                request.ReferenceId);

            // 2) Send the command to the mediator handler
            var result = await _mediator.Send(cmd, ct);

            // 3) Handle the result and return appropriate HTTP response
            var id = result.OkOrThrow();

            return Ok(new { transactionId = id });
        }

        [HttpGet("stock-overview")]
        public async Task<IActionResult> GetStockOverview(
            [FromQuery] int? warehouseId,
            [FromQuery] int? productId,
            [FromQuery] bool lowStockOnly,
            CancellationToken ct)
        {
            // 1) Create and send the GetStockOverviewQuery to the mediator
            var query = new GetStockOverviewQuery(
                warehouseId,
                productId,
                lowStockOnly);

            var result = await _mediator.Send(query, ct);

            // 2) Handle the result and return appropriate HTTP response
            var data = result.OkOrThrow();

            return Ok(data);
        }
    }
}

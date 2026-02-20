using IMS.Api.Auth;
using IMS.Api.Common;
using IMS.Application.Features.Reports.Queries.DeadStock;
using IMS.Application.Features.Reports.Queries.LowStock;
using IMS.Application.Features.Reports.Queries.StockMovements;
using IMS.Application.Features.Reports.Queries.StockValuation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.Api.Controllers
{
    [Authorize(Policy = Policies.ReportsRead)]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReportsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("stock-movements")]
        public async Task<IActionResult> StockMovements(
            [FromQuery] DateTime fromUtc,
            [FromQuery] DateTime toUtc,
            [FromQuery] int? warehouseId,
            [FromQuery] int? productId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            CancellationToken ct = default)
        {
            // 1) Create a GetStockMovementsQuery object with the provided query parameters
            var query = new GetStockMovementsQuery(fromUtc, toUtc, warehouseId, productId, page, pageSize);

            // 2) Send the query to the MediatR pipeline and await the result
            var result = await _mediator.Send(query, ct);

            // 3) Check if the result indicates success or failure and return the appropriate HTTP response
            var data = result.OkOrThrow();

            return Ok(data);
        }

        // Endpoint to get low stock report
        [HttpGet("low-stock")]
        public async Task<IActionResult> LowStock(
            [FromQuery] int? warehouseId,
            [FromQuery] int? productId,
            CancellationToken ct = default)
        {
            // 1) Create a GetLowStockReportQuery object with the provided query parameters
            var query = new GetLowStockReportQuery(warehouseId, productId);

            // 2) Send the query to the MediatR pipeline and await the result
            var result = await _mediator.Send(query, ct);

            // 3) Check if the result indicates success or failure and return the appropriate HTTP response
            var data = result.OkOrThrow();

            return Ok(data);
        }

        // Endpoint to get dead stock report
        [HttpGet("dead-stock")]
        public async Task<IActionResult> DeadStock(
            [FromQuery] int days = 30,
            [FromQuery] int? warehouseId = null,
            CancellationToken ct = default)
        {
            // 1) Create a GetDeadStockReportQuery object with the provided query parameters
            var query = new GetDeadStockReportQuery(days, warehouseId);

            // 2) Send the query to the MediatR pipeline and await the result
            var result = await _mediator.Send(query, ct);

            // 3) Check if the result indicates success or failure and return the appropriate HTTP response
            var data = result.OkOrThrow();

            return Ok(data);
        }

        // Endpoint to get stock valuation report
        [HttpGet("stock-valuation")]
        public async Task<IActionResult> StockValuation(
            [FromQuery] StockValuationMode mode = StockValuationMode.Fifo,
            [FromQuery] int? warehouseId = null,
            [FromQuery] int? productId = null,
            CancellationToken ct = default)
        {
            // 1) Create a GetStockValuationReportQuery object with the provided query parameters
            var query = new GetStockValuationReportQuery(mode, warehouseId, productId);

            // 2) Send the query to the MediatR pipeline and await the result
            var result = await _mediator.Send(query, ct);

            // 3) Check if the result indicates success or failure and return the appropriate HTTP response
            var data = result.OkOrThrow();

            return Ok(data);
        }

    }
}

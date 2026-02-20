using IMS.Api.Auth;
using IMS.Api.Common;
using IMS.Application.Features.Lookups.Queries.LocationLookup;
using IMS.Application.Features.Lookups.Queries.ProductLookup;
using IMS.Application.Features.Lookups.Queries.WarehouseLookup;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.Api.Controllers
{
    [Authorize(Policy = Policies.InventoryRead)]
    [Route("api/[controller]")]
    [ApiController]
    public class LookupsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LookupsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET /api/lookups/products?search=&activeOnly=true&take=20
        [HttpGet("products")]
        public async Task<IActionResult> Products(
            [FromQuery] string? search,
            [FromQuery] bool activeOnly = true,
            [FromQuery] int take = 20,
            CancellationToken ct = default)
        {
            var items = (await _mediator
                .Send(new GetProductsLookupQuery(search, activeOnly, take), ct))
                .OkOrThrow();

            return Ok(items);
        }

        // GET /api/lookups/warehouses?activeOnly=true
        [HttpGet("warehouses")]
        public async Task<IActionResult> Warehouses(
            [FromQuery] bool activeOnly = true,
            CancellationToken ct = default)
        {
            var items = (await _mediator
                .Send(new GetWarehousesLookupQuery(activeOnly), ct))
                .OkOrThrow();

            return Ok(items);
        }

        // GET /api/lookups/warehouses/{warehouseId}/locations?search=&activeOnly=true&take=50
        [HttpGet("warehouses/{warehouseId:int}/locations")]
        public async Task<IActionResult> Locations(
            [FromRoute] int warehouseId,
            [FromQuery] string? search,
            [FromQuery] bool activeOnly = true,
            [FromQuery] int take = 50,
            CancellationToken ct = default)
        {
            var items = (await _mediator
                .Send(new GetLocationsLookupQuery(warehouseId, search, activeOnly, take), ct))
                .OkOrThrow();

            return Ok(items);
        }
    }
}

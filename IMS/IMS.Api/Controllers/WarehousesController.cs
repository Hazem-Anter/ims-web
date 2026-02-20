using IMS.Api.Auth;
using IMS.Api.Common;
using IMS.Api.Contracts.Warehouses;
using IMS.Application.Features.Warehouses.Commands.ActivateWarehouse;
using IMS.Application.Features.Warehouses.Commands.CreateWarehouse;
using IMS.Application.Features.Warehouses.Commands.DeactivateWarehouse;
using IMS.Application.Features.Warehouses.Commands.UpdateWarehouse;
using IMS.Application.Features.Warehouses.Queries.GetWarehouseById;
using IMS.Application.Features.Warehouses.Queries.ListWarehouses;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = Policies.InventoryRead)]
    public class WarehousesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public WarehousesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize(Policy = Policies.InventoryWrite)]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateWarehouseRequest req, CancellationToken ct)
        {
            var id = (await _mediator.Send(
                 new CreateWarehouseCommand(req.Name, req.Code), ct))
                .OkOrThrow();
            return Ok(new CreateWarehouseResponse(id));
        }

        
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var dto = (await _mediator.Send(
                new GetWarehouseByIdQuery(id), ct))
                .OkOrThrow();
            return Ok(dto);
        }

        // GET /api/warehouses?search=main&isActive=true&page=1&pageSize=20
        [HttpGet]
        public async Task<IActionResult> List(
            [FromQuery] string? search,
            [FromQuery] bool? isActive,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken ct = default)
        {
            var data = (await _mediator.Send(
                new ListWarehousesQuery(search, isActive, page, pageSize), ct))
                .OkOrThrow();
            return Ok(data);
        }

        // PUT /api/warehouses/5 with JSON body { "name": "New Name", "code": "NEWCODE" }
        [Authorize(Policy = Policies.InventoryWrite)]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateWarehouseRequest req, CancellationToken ct)
        {
            var wid = (await _mediator.Send(new UpdateWarehouseCommand(id, req.Name, req.Code), ct)).OkOrThrow();
            return Ok(new { warehouseId = wid });
        }

        // PATCH /api/warehouses/5/activate
        [Authorize(Policy = Policies.InventoryWrite)]
        [HttpPatch("{id:int}/activate")]
        public async Task<IActionResult> Activate(int id, CancellationToken ct)
        {
            var wid = (await _mediator.Send(new ActivateWarehouseCommand(id), ct)).OkOrThrow();
            return Ok(new { warehouseId = wid });
        }

        // PATCH /api/warehouses/5/deactivate
        [Authorize(Policy = Policies.InventoryWrite)]
        [HttpPatch("{id:int}/deactivate")]
        public async Task<IActionResult> Deactivate(int id, CancellationToken ct)
        {
            var wid = (await _mediator.Send(new DeactivateWarehouseCommand(id), ct)).OkOrThrow();
            return Ok(new { warehouseId = wid });
        }


    }
}

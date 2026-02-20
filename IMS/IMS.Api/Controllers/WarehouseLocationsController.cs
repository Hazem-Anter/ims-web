using IMS.Api.Auth;
using IMS.Api.Common;
using IMS.Api.Contracts.Locations;
using IMS.Application.Features.Locations.Commands.ActivateLocation;
using IMS.Application.Features.Locations.Commands.CreateLocation;
using IMS.Application.Features.Locations.Commands.DeactivateLocation;
using IMS.Application.Features.Locations.Commands.UpdateLocation;
using IMS.Application.Features.Locations.Queries.GetLocationById;
using IMS.Application.Features.Locations.Queries.ListLocations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IMS.Api.Controllers;

[Route("api/warehouses/{warehouseId:int}/locations")]
[ApiController]
[Authorize(Policy = Policies.InventoryRead)]
public sealed class WarehouseLocationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public WarehouseLocationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [Authorize(Policy = Policies.InventoryWrite)]
    [HttpPost]
    public async Task<IActionResult> Create(int warehouseId, [FromBody] CreateLocationRequest req, CancellationToken ct)
    {
        var id = (await _mediator.Send(new CreateLocationCommand(warehouseId, req.Code), ct)).OkOrThrow();
        return Ok(new CreateLocationResponse(id));
    }

    [Authorize(Policy = Policies.InventoryWrite)]
    [HttpPut("{locationId:int}")]
    public async Task<IActionResult> Update(int warehouseId, int locationId, [FromBody] UpdateLocationRequest req, CancellationToken ct)
    {
        var id = (await _mediator.Send(new UpdateLocationCommand(warehouseId, locationId, req.Code), ct)).OkOrThrow();
        return Ok(new { locationId = id });
    }

    
    [HttpGet]
    public async Task<IActionResult> List(
        int warehouseId,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        CancellationToken ct)
    {
        var items = (await _mediator.Send(new ListLocationsQuery(warehouseId, search, isActive), ct)).OkOrThrow();
        return Ok(items);
    }


    [HttpGet("{locationId:int}")]
    public async Task<IActionResult> GetById(int warehouseId, int locationId, CancellationToken ct)
    {
        var dto = (await _mediator.Send(new GetLocationByIdQuery(warehouseId, locationId), ct)).OkOrThrow();
        return Ok(dto);
    }

    [Authorize(Policy = Policies.InventoryWrite)]
    [HttpPatch("{locationId:int}/activate")]
    public async Task<IActionResult> Activate(int warehouseId, int locationId, CancellationToken ct)
    {
        var id = (await _mediator.Send(new ActivateLocationCommand(warehouseId, locationId), ct)).OkOrThrow();
        return Ok(new { locationId = id });
    }

    [Authorize(Policy = Policies.InventoryWrite)]
    [HttpPatch("{locationId:int}/deactivate")]
    public async Task<IActionResult> Deactivate(int warehouseId, int locationId, CancellationToken ct)
    {
        var id = (await _mediator.Send(new DeactivateLocationCommand(warehouseId, locationId), ct)).OkOrThrow();
        return Ok(new { locationId = id });
    }

}

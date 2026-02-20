namespace IMS.Api.Contracts.Warehouses
{
    // Request model for updating an existing warehouse.
    public sealed record UpdateWarehouseRequest(string Name, string Code);
}

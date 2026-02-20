

namespace IMS.Api.Contracts.Warehouses
{
    // Request model for creating a new warehouse,
    // containing the necessary information such as the warehouse name and location.
    public sealed record CreateWarehouseRequest(string Name, string Code);
}

namespace IMS.Api.Contracts.Inventory
{
    public sealed record TransferStockRequest(
        int ProductId,
        int FromWarehouseId,
        int? FromLocationId,
        int ToWarehouseId,
        int? ToLocationId,
        int Quantity,
        string? ReferenceType,
        string? ReferenceId
        );
}

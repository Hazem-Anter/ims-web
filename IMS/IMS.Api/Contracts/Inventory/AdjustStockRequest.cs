namespace IMS.Api.Contracts.Inventory
{
    public sealed record AdjustStockRequest(
        int ProductId,
        int WarehouseId,
        int? LocationId,
        int DeltaQuantity,
        string Reason,
        string? ReferenceType,
        string? ReferenceId
        );
}

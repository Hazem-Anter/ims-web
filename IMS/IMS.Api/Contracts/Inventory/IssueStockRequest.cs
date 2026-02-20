namespace IMS.Api.Contracts.Inventory
{
    public sealed record IssueStockRequest(
        int ProductId,
        int WarehouseId,
        int? LocationId,
        int Quantity,
        string? ReferenceType,
        string? ReferenceId
        );
}

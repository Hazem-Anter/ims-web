namespace IMS.Api.Contracts.Inventory
{
    // DTO for receiving stock request from API clients 
    // API layer uses this record to encapsulate the data needed to process a stock receipt
    // API should not expose application layer objects directly
    public sealed record ReceiveStockRequest(
        int ProductId,
        int WarehouseId,
        int? LocationId,
        int Quantity,
        decimal? UnitCost,
        string? ReferenceType,
        string? ReferenceId
        
    );
}

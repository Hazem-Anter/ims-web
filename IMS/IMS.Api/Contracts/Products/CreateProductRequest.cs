namespace IMS.Api.Contracts.Products
{
    // Request contract for creating a new product in the inventory system
    public sealed record CreateProductRequest(
        string Name,
        string Sku,
        string? Barcode,
        int MinStockLevel = 0
        );
}

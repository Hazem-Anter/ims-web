namespace IMS.Api.Contracts.Products
{
    // This record defines the structure of the request body for updating an existing product's details,
    public sealed record UpdateProductRequest(
        string Name,
        string Sku,
        string? Barcode,
        int MinStockLevel
        //bool IsActive       // The IsActive property indicates whether the product is currently active or not,
                            // allowing for soft deletion or deactivation of products without removing them from the database.
     );
}

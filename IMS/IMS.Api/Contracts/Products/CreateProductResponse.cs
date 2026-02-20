namespace IMS.Api.Contracts.Products
{
    // Response contract for the CreateProduct endpoint, returning the ID of the newly created product
    public sealed record CreateProductResponse(int ProductId);
}

using IMS.Api.Auth;
using IMS.Api.Common;
using IMS.Api.Contracts.Products;
using IMS.Application.Features.Products.Commands.ActivateProduct;
using IMS.Application.Features.Products.Commands.CreateProduct;
using IMS.Application.Features.Products.Commands.DeactivateProduct;
using IMS.Application.Features.Products.Commands.UpdateProduct;
using IMS.Application.Features.Products.Queries.GetProductByBarcode;
using IMS.Application.Features.Products.Queries.GetProductById;
using IMS.Application.Features.Products.Queries.ListProducts;
using IMS.Application.Features.Products.Queries.ProductTimeline;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IMS.Api.Controllers
{

    [Authorize(Policy = Policies.InventoryRead)]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProductsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // Get the timeline of stock movements for a specific product,
        // with optional filtering by date range and warehouse, and support for pagination.
        // ex --> GET: api/products/{productId}/timeline?fromUtc=2024-01-01T00:00:00Z&toUtc=2024-12-31T23:59:59Z&warehouseId=1&page=1&pageSize=50
        [HttpGet("{productId:int}/timeline")]
        public async Task<IActionResult> Timeline(
        [FromRoute] int productId,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        [FromQuery] int? warehouseId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
        {
            var query = new GetProductTimelineQuery(
                productId,
                fromUtc,
                toUtc,
                warehouseId,
                page,
                pageSize);

            var result = await _mediator.Send(query, ct);

            var data = result.OkOrThrow();

            return Ok(data);
        }

        // Create a new product with the specified details,
        // including name, SKU, optional barcode, and minimum stock level.
        [Authorize(Policy = Policies.InventoryWrite)]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductRequest req, CancellationToken ct)
        {
            // 1) Validate the incoming request data (e.g., check for required fields, validate formats).
            var id = (await _mediator.Send(
                new CreateProductCommand(req.Name, req.Sku, req.Barcode, req.MinStockLevel), ct))
                .OkOrThrow();

            // 2) return a response containing the ID of the newly created product,
            // along with any relevant metadata or links for further actions (e.g., retrieving the product details).
            return Ok(new CreateProductResponse(id));
        }

        // Retrieve product details by barcode,
        // allowing authorized users to look up products using their barcode information.
        [HttpGet("by-barcode/{barcode}")]
        public async Task<IActionResult> GetByBarcode(string barcode, CancellationToken ct)
        {
            var dto = (await _mediator.Send(
                new GetProductByBarcodeQuery(barcode), ct))
                .OkOrThrow();

            return Ok(dto);
        }

        // Retrieve product details by product ID,
        // allowing authorized users to look up products using their unique identifier.
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var dto = (await _mediator.Send(
                new GetProductByIdQuery(id), ct))
                .OkOrThrow();

            return Ok(dto);
        }

        // List products with optional filtering by name or SKU or BarcodeS, and support for pagination,

        // GET /api/products?search=milk&isActive=true&page=1&pageSize=20
        [HttpGet]
        public async Task<IActionResult> List(
            [FromQuery] string? search,
            [FromQuery] bool? isActive,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken ct = default)
        {
            var query = new ListProductsQuery(search, isActive, page, pageSize);

            var result = await _mediator.Send(query, ct);

            var data = result.OkOrThrow();

            return Ok(data);
        }

        // Update product details such as name, SKU, barcode, and minimum stock level,
        [Authorize(Policy = Policies.InventoryWrite)]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductRequest req, CancellationToken ct)
        {
            var updatedId = (await _mediator.Send(
                new UpdateProductCommand(id, req.Name, req.Sku, req.Barcode, req.MinStockLevel), ct))
                .OkOrThrow();

            return Ok(new { productId = updatedId });
        }

        // Activate a product, making it available for stock movements and transactions.
        [Authorize(Policy = Policies.InventoryWrite)]
        [HttpPatch("{id:int}/activate")]
        public async Task<IActionResult> Activate(int id, CancellationToken ct)
        {
            var pid = (await _mediator.Send(new ActivateProductCommand(id), ct))
                .OkOrThrow();

            return Ok(new { productId = pid });
        }

        // Deactivate a product, preventing it from being used in stock movements and transactions.
        [Authorize(Policy = Policies.InventoryWrite)]
        [HttpPatch("{id:int}/deactivate")]
        public async Task<IActionResult> Deactivate(int id, CancellationToken ct)
        {
            var pid = (await _mediator.Send(new DeactivateProductCommand(id), ct))
                .OkOrThrow();

            return Ok(new { productId = pid });
        }

    }
}

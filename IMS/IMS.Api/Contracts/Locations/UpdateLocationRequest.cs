namespace IMS.Api.Contracts.Locations
{
    // Request model for updating an existing location's details, such as its code.
    public sealed record UpdateLocationRequest(string Code);
}

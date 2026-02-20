using IMS.Application.Common.Exceptions;
using IMS.Application.Common.Results;

namespace IMS.Api.Common
{
    // The ResultHttpMapper class provides extension methods to map application results (Result<T>) to appropriate HTTP responses.
    // It includes a method OkOrThrow that checks if the result is successful and returns the value if it is,
    // or throws a ConflictException if the operation failed, which will be handled by the global exception middleware to return a standardized error response.
    public static class ResultHttpMapper
    {
        public static T OkOrThrow<T>(this Result<T> result)
        {
            if (result.IsSuccess)
                return result.Value!;

            
            throw new ConflictException(result.Error ?? "Operation failed.");
        }
    }
}

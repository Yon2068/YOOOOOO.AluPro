using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace YOOOOOO.AluPro.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "An unhandled exception has occurred.");

        var problemDetails = new ProblemDetails
        {
            Instance = httpContext.Request.Path
        };

        // In a real app, use custom exceptions like ValidationException, NotFoundException, etc.
        if (exception.Message == "Invalid account or password." || 
            exception.Message == "User already exists.")
        {
            problemDetails.Title = "Bad Request";
            problemDetails.Detail = exception.Message;
            problemDetails.Status = StatusCodes.Status400BadRequest;
        }
        else
        {
            problemDetails.Title = "Server Error";
            problemDetails.Detail = exception.Message; // For dev, show message. Prod should hide it.
            problemDetails.Status = StatusCodes.Status500InternalServerError;
        }

        httpContext.Response.StatusCode = problemDetails.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}

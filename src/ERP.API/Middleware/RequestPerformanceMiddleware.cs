using System.Diagnostics;

namespace ERP.API.Middleware
{
    public class RequestPerformanceMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestPerformanceMiddleware> _logger;
        private readonly IConfiguration _configuration;

        public RequestPerformanceMiddleware(
            RequestDelegate next,
            ILogger<RequestPerformanceMiddleware> logger,
            IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();
                var elapsedMilliseconds = stopwatch.ElapsedMilliseconds;
                
                // Log all requests
                _logger.LogInformation(
                    "Request {Method} {Path} completed in {ElapsedMilliseconds}ms with status {StatusCode}",
                    context.Request.Method,
                    context.Request.Path,
                    elapsedMilliseconds,
                    context.Response.StatusCode);
                
                // Log slow requests as warnings
                var threshold = _configuration.GetValue<int>("PerformanceSettings:ResponseTimeThresholdMs", 100);
                if (elapsedMilliseconds > threshold)
                {
                    _logger.LogWarning(
                        "Slow request detected: {Method} {Path} took {ElapsedMilliseconds}ms (threshold: {Threshold}ms)",
                        context.Request.Method,
                        context.Request.Path,
                        elapsedMilliseconds,
                        threshold);
                }
                
                // Add response time as header for debugging
                context.Response.Headers.Add("X-Response-Time-Ms", elapsedMilliseconds.ToString());
            }
        }
    }
}

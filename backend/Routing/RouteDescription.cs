namespace Musketeer.Routing
{
    public class RouteDescription
    {
        private bool hideInApiDocumentation;

        public RouteDescription(
            string endpoint,
            HttpMethod httpMethod,
            Delegate handler,
            bool hideInApiDocumentation = false,
            string? summary = null,
            string? description = null,
            Type? requestType = null,
            Type? responseType = null,
            Dictionary<string, string>? expectedHeaders = null // New property
        )
        {
            Endpoint = endpoint;
            HideInApiDocumentation = hideInApiDocumentation;
            HttpMethod = httpMethod;
            Handler = handler;
            Summary = summary;
            Description = description;
            RequestType = requestType;
            ResponseType = responseType;
            ExpectedHeaders = expectedHeaders; // Initialize the new property
        }

        public string? Summary { get; private set; }
        public string? Description { get; private set; }
        public string Endpoint { get; private set; }

        public bool HideInApiDocumentation
        {
            get => hideInApiDocumentation;
            private set => hideInApiDocumentation = value;
        }

        public HttpMethod HttpMethod { get; private set; }

        public Delegate Handler { get; private set; }

        public Type? RequestType { get; private set; }
        public Type? ResponseType { get; private set; }

        // New property to store expected headers
        public Dictionary<string, string>? ExpectedHeaders { get; private set; }

        public override bool Equals(object? obj)
        {
            if (obj is RouteDescription other)
            {
                return string.Equals(Endpoint, other.Endpoint, StringComparison.OrdinalIgnoreCase);
            }
            return false;
        }

        public override int GetHashCode()
        {
            return Endpoint?.ToLowerInvariant().GetHashCode() ?? 0;
        }
    }
}
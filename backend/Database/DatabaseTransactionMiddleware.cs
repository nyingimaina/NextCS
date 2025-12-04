
using {{your-app-name}}.HttpHeaders;
using Rocket.Libraries.DatabaseIntegrator;

namespace {{your-app-name}}.Database
{
    public class DatabaseTransactionMiddleware
    {
        private readonly RequestDelegate next;

        public DatabaseTransactionMiddleware(
            RequestDelegate next
        )
        {
            this.next = next;
        }

        public async Task InvokeAsync(
            HttpContext context,
            IDatabaseHelper<Guid> databaseHelper,
            IBackgroundHeadersProvider backgroundHeadersProvider)
        {
            try
            {
                
                UseTransactionOnlyWhenNecessary(context, () => databaseHelper.BeginTransaction());
                backgroundHeadersProvider.SetHeaders(
                    context
                    .Request
                    .Headers.Select(x => new KeyValuePair<string, string>(x.Key, x.Value.ToString()))
                    .ToDictionary(x => x.Key, x => x.Value));
                await next(context);
                UseTransactionOnlyWhenNecessary(context, () => databaseHelper.CommitTransaction());
            }
            catch
            {
                UseTransactionOnlyWhenNecessary(context, () => databaseHelper.RollBackTransaction());
                throw;
            }
        }

        private void UseTransactionOnlyWhenNecessary(
             HttpContext context,
             Action transactionAction
        )
        {
            var exclusionList = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "/api/telex-releasing/release",
                "/api/akl-house-line-bl/search",
                "/api/akl-house-line-bl/pregenerate",
                "/api/bill-of-lading-copy/download-copy-bills-by-generation-session-id",
                "/api/bill-of-lading-copy/get-version-number-by-house-bill-of-lading-number"
            };

            var isOptions = string.Equals(context.Request.Method, "OPTIONS", StringComparison.OrdinalIgnoreCase);
            var exclude = exclusionList.Contains(context.Request.Path.Value ?? string.Empty);
            var useTransaction = !isOptions && !exclude;
            if (useTransaction)
            {
                transactionAction();
            }

        }


    }

}
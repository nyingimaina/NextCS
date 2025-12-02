namespace Contrail
{
    public static class UILauncher
    {
        public static async Task LaunchIfRequestedAsync(string[] args, WebApplication app)
        {
            if (args.Contains("-ui"))
            {
                // Wait 5 seconds to give the app time to start
                await Task.Delay(5000);

                // Grabs first URL Kestrel is configured to listen on
                var url = app.Urls.FirstOrDefault();
                if (!string.IsNullOrEmpty(url))
                {
                    using var process = new System.Diagnostics.Process();
                    process.StartInfo = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = url,
                        UseShellExecute = true
                    };
                    process.Start();
                }
            }
        }
    }
}

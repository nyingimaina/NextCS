using auto_dial;

namespace Contrail
{
    public static class ServiceRegistry
    {
        public static IServiceCollection RegisterCustomServices(this IServiceCollection services)
        {
            return services
                .AddAutoDial(options =>
                {
                    options.IfExceptionOccurs((exception) =>
                    {
                        // Handle the exception (log it, rethrow, etc.)
                        Console.WriteLine($"An error occurred during service registration: {exception.Message}");
                    });
                    options.InNamespaceStartingWith("Contrail");
                    options.FromAssemblyOf<Program>();
                });
                
        }
    }
}
using Musketeer.Routing;

namespace Contrail
{
    public static class RouteRegistry
    {
        public static WebApplication RegisterCustomRoutes(this WebApplication webApplication)
        {

            var explicitRoutes = new List<RouterBase>
            {
                
            };



            return webApplication.FinalizeRegistry(explicitRoutes.ToArray());
        }
        
        private static WebApplication FinalizeRegistry(
            this WebApplication webApplication,
            params RouterBase[] routers
        )
        {
            var routeGroupBuilder = webApplication.MapGroup("/").DisableAntiforgery();
            foreach (var specificRouter in routers)
            {
                specificRouter.RegisterEndpoints(routeGroupBuilder);
            }
            return webApplication;
        }
    }
}
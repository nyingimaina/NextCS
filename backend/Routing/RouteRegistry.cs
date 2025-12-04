namespace {{your-app-name}}.Routing
{
    public static class RouteRegistry
    {
            
        public static WebApplication RegisterCustomRoutes(this WebApplication webApplication)
        {
            var routers = RouterDiscoveryUtility.DiscoverAndInitializeCrudRouters(typeof(RouteRegistry).Assembly);
            

            return webApplication.RegisterRouters(routers.ToArray());
        }
        
        
        private static WebApplication RegisterRouters(
            this WebApplication webApplication,
            params RouterBase[] routers)
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
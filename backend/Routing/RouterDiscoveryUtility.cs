using System.Reflection;
using {{your-app-name}}.Routing;

namespace {{your-app-name}}.Routing
{
 
    public static class RouterDiscoveryUtility
    {
        public static RouterBase[] DiscoverAndInitializeCrudRouters(Assembly assembly)
        {
            Type baseCrudRouterType = typeof(RouterBase);

            
            var routerTypes = assembly.GetTypes()
                .Where(t => t.IsClass && !t.IsAbstract && InheritsGenericRouterBase(t, baseCrudRouterType))
                .ToList();

            var initializedRouters = new List<RouterBase>();

            foreach (var specificRouterType in routerTypes)
            {
                // Attempt to initialize using the default constructor
                try
                {
                    var instance = Activator.CreateInstance(specificRouterType);
                    var router = instance as RouterBase;
                    if (router != null)
                    {
                        initializedRouters.Add(router);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to initialize {specificRouterType.Name}: {ex.Message}");
                }
            }

            return initializedRouters.ToArray();
        }

        private static bool InheritsGenericRouterBase(Type type, Type baseType)
        {
            // Check if the type directly inherits from the open generic base type
            while (type != null && type != typeof(object))
            {
                var currentType = type.IsGenericType ? type.GetGenericTypeDefinition() : type;
                if (currentType == baseType)
                {
                    return true;
                }
                if (type.BaseType != null)
                {
                    type = type.BaseType;
                }
            }
            return false;
        }
    }
}
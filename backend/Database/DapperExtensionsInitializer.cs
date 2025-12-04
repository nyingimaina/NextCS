namespace {{your-app-name}}.Database
{
    public static class DapperExtensionsInitializer
    {
        static DapperExtensionsInitializer()
        {
            // Ensure the delegate is initialized
            // SqlMapperExtensions.GetDatabaseType = _ => "mariadb";
        }

        public static void Initialize() { }
    }
}
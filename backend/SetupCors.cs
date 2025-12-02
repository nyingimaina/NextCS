namespace Contrail
{
    public static class SetupCors
    {
        private const string PolicyName = "AllowAll";
        public static void ConfigureCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(PolicyName, builder =>
                {
                    builder.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });
        }

        public static void EnforceCors(this IApplicationBuilder app)
        {
            app.UseCors(PolicyName);
        }
    }
}


using System.Net;
using Contrail;
using {{your-app-name}}.Emailing;
using Microsoft.AspNetCore.Diagnostics;
using Serilog;

var builder = WebApplication.CreateBuilder(args);


builder.Services.ConfigureCors();



if (Environment.UserInteractive == false)
{
    builder.Host.UseWindowsService(options =>
    {
        options.ServiceName = $"{Statics.ApplicationName}";
    });
}

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();
// Add services to the container.
builder.Services.RegisterCustomServices();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services
    .AddOptions<EmailConfiguration>()
    // .Bind(builder.Configuration)
    // .PostConfigure(cfg =>
    // {
    //     Func<string?, string> decryptPassword = (password) =>
    //     {
    //         if (string.IsNullOrEmpty(password))
    //         {
    //             return string.Empty;
    //         }
    //         return new SymmetricPasswordJsonConverter().DecryptValue(password);
    //     };
    //     cfg.EmailConfiguration.Password = decryptPassword(cfg.EmailConfiguration.Password);
    // })
    .ValidateOnStart();

var app = builder.Build();
app.EnforceCors();
app.RegisterCustomRoutes();

app.UseExceptionHandler(handlerApp =>
{
    handlerApp.Run(async context =>
    {
        var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

        if (exceptionHandlerFeature?.Error is Exception ex)
        {
            // log full details
            logger.LogError(ex, "Unhandled exception occurred while processing request {Path}", context.Request.Path);

            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            // return safe error response
            await context.Response.WriteAsJsonAsync(new
            {
                error = "An unexpected error occurred.",
                traceId = context.TraceIdentifier
            });
        }
    });
});


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable serving static files from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();



_ = UILauncher.LaunchIfRequestedAsync(args, app);

app.Run();

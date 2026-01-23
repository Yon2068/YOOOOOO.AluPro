using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using YOOOOOO.AluPro.Api.Middleware;
using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Application.Auth;
using YOOOOOO.AluPro.Application.Authors;
using YOOOOOO.AluPro.Application.Contents;
using YOOOOOO.AluPro.Application.Models;
using YOOOOOO.AluPro.Application.Search;
using YOOOOOO.AluPro.Application.Users;
using Microsoft.EntityFrameworkCore;
using YOOOOOO.AluPro.Infrastructure;
using YOOOOOO.AluPro.Infrastructure.Persistence;
using YOOOOOO.AluPro.Infrastructure.Persistence.Repositories;

var builder = WebApplication.CreateBuilder(args);

const string corsPolicyName = "Frontend";

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "AluPro API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        corsPolicyName,
        policy =>
            policy
                .WithOrigins(
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:4173",
                    "http://127.0.0.1:4173")
                .AllowAnyHeader()
                .AllowAnyMethod());
});

builder.Services.AddDbContext<AluProDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<IAuthorRepository, EfAuthorRepository>();
builder.Services.AddScoped<IModelRepository, EfModelRepository>();
builder.Services.AddScoped<IContentRepository, EfContentRepository>();
builder.Services.AddScoped<IUserQueries, EfUserQueries>();
builder.Services.AddScoped<IAuthService, EfAuthService>();
builder.Services.AddScoped<IUserActionService, EfUserActionService>();
builder.Services.AddTransient<DbInitializer>();

builder.Services.AddScoped<GetModelsHandler>();
builder.Services.AddScoped<GetModelByIdHandler>();
builder.Services.AddScoped<ToggleModelFavoriteHandler>();
builder.Services.AddScoped<DownloadModelHandler>();
builder.Services.AddScoped<GetContentHandler>();
builder.Services.AddScoped<GetContentByIdHandler>();
builder.Services.AddScoped<PublishContentHandler>();
builder.Services.AddScoped<SearchAggregateHandler>();
builder.Services.AddScoped<GetAuthorProfileHandler>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ToggleAuthorFollowHandler>();
builder.Services.AddScoped<GetMeHandler>();
builder.Services.AddScoped<GetFavoritesHandler>();
builder.Services.AddScoped<GetHistoryHandler>();
builder.Services.AddScoped<ClearHistoryHandler>();
builder.Services.AddScoped<GetPurchasesHandler>();
builder.Services.AddScoped<PurchaseModelHandler>();
builder.Services.AddScoped<GetMyModelsHandler>();
builder.Services.AddScoped<GetMyContentsHandler>();
builder.Services.AddScoped<LoginHandler>();
builder.Services.AddScoped<RegisterHandler>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

// Run migration and seeding
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AluProDbContext>();
    db.Database.Migrate();
    
    var seeder = scope.ServiceProvider.GetRequiredService<DbInitializer>();
    await seeder.SeedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseCors(corsPolicyName);

app.UseAuthentication();
app.UseAuthorization();

var api = app.MapGroup("/api");

api.MapGet("/health", () => TypedResults.Ok(new { status = "ok" }));

api.MapGet(
    "/models",
    async Task<Ok<IReadOnlyList<ModelCardDto>>> (
        string? category,
        string? q,
        GetModelsHandler handler,
        CancellationToken ct) =>
    {
        var items = await handler.Handle(new GetModelsQuery(category, q), ct);
        return TypedResults.Ok(items);
    });

api.MapGet(
    "/models/{id}",
    async Task<Results<Ok<ModelDetailDto>, NotFound>> (Guid id, GetModelByIdHandler handler, CancellationToken ct) =>
    {
        var item = await handler.Handle(new GetModelByIdQuery(id), ct);
        return item is null ? TypedResults.NotFound() : TypedResults.Ok(item);
    });

api.MapPost(
    "/models/{id}/purchase",
    async Task<Results<Ok<PurchaseResultDto>, NotFound>> (Guid id, PurchaseModelHandler handler, CancellationToken ct) =>
    {
        var result = await handler.Handle(new PurchaseModelCommand(id), ct);
        // If not found, handler currently returns result with success=false. 
        // We should handle "Not Found" better or just return OK with error message.
        // For simplicity, return OK with the result object.
        return TypedResults.Ok(result);
    })
    .RequireAuthorization();

api.MapPost(
    "/models/{id}/download",
    async Task<Results<Ok<DownloadResultDto>, NotFound, ForbidHttpResult>> (Guid id, DownloadModelHandler handler, CancellationToken ct) =>
    {
        var result = await handler.Handle(new DownloadModelCommand(id), ct);
        if (result is null)
        {
             // Could be Not Found or Not Purchased.
             // Since handler returns null for both, we might want to be more specific.
             // But for now, 404 or 403.
             // Let's assume 403 if it exists but not purchased? 
             // Handler logic: returns null if not found OR not purchased.
             // We should improve handler to distinguish.
             return TypedResults.NotFound(); 
        }
        return TypedResults.Ok(result);
    })
    .RequireAuthorization();

api.MapPost(
    "/models/{id}/favorite",
    async Task<Results<Ok<ToggleResultDto>, NotFound>> (Guid id, ToggleModelFavoriteHandler handler, CancellationToken ct) =>
    {
        var result = await handler.Handle(new ToggleModelFavoriteCommand(id), ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    })
    .RequireAuthorization();

api.MapGet(
    "/contents",
    async Task<Ok<IReadOnlyList<ContentCardDto>>> (
        string? type,
        string? q,
        GetContentHandler handler,
        CancellationToken ct) =>
    {
        var items = await handler.Handle(new GetContentQuery(type, q), ct);
        return TypedResults.Ok(items);
    });

api.MapGet(
    "/contents/{id}",
    async Task<Results<Ok<ContentDetailDto>, NotFound>> (Guid id, GetContentByIdHandler handler, CancellationToken ct) =>
    {
        var item = await handler.Handle(new GetContentByIdQuery(id), ct);
        return item is null ? TypedResults.NotFound() : TypedResults.Ok(item);
    });

api.MapGet(
    "/search",
    async Task<Ok<SearchResultDto>> (
        string? q,
        SearchAggregateHandler handler,
        CancellationToken ct) =>
    {
        var result = await handler.Handle(q ?? "", ct);
        return TypedResults.Ok(result);
    });

api.MapPost(
    "/contents",
    async Task<Results<Created<ContentDetailDto>, BadRequest<string>>> (PublishContentRequest request, PublishContentHandler handler, CancellationToken ct) =>
    {
        if (string.IsNullOrWhiteSpace(request.Type) || string.IsNullOrWhiteSpace(request.Title))
        {
            return TypedResults.BadRequest("Type and title are required.");
        }

        var created = await handler.Handle(
            new PublishContentCommand(
                request.Type,
                request.Title,
                request.Cover,
                request.Summary,
                request.Body,
                request.VideoUrl),
            ct);

        return TypedResults.Created($"/api/contents/{created.Id}", created);
    })
    .RequireAuthorization();

api.MapGet(
    "/authors/{id}",
    async Task<Results<Ok<AuthorProfileDto>, NotFound>> (Guid id, GetAuthorProfileHandler handler, CancellationToken ct) =>
    {
        var author = await handler.Handle(new GetAuthorProfileQuery(id), ct);
        return author is null ? TypedResults.NotFound() : TypedResults.Ok(author);
    });

api.MapPost(
    "/authors/{id}/follow",
    async Task<Results<Ok<ToggleResultDto>, NotFound>> (Guid id, ToggleAuthorFollowHandler handler, CancellationToken ct) =>
    {
        var result = await handler.Handle(new ToggleAuthorFollowCommand(id), ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    })
    .RequireAuthorization();

api.MapGet(
    "/users/me",
    async Task<Ok<UserDto>> (GetMeHandler handler, CancellationToken ct) =>
    {
        var user = await handler.Handle(ct);
        return TypedResults.Ok(user);
    })
    .RequireAuthorization();

api.MapGet(
    "/users/me/favorites",
    async Task<Ok<IReadOnlyList<FavoriteItemDto>>> (string? type, GetFavoritesHandler handler, CancellationToken ct) =>
    {
        var items = await handler.Handle(new GetFavoritesQuery(type), ct);
        return TypedResults.Ok(items);
    })
    .RequireAuthorization();

api.MapGet(
    "/users/me/history",
    async Task<Ok<IReadOnlyList<HistoryGroupDto>>> (GetHistoryHandler handler, CancellationToken ct) =>
    {
        var items = await handler.Handle(ct);
        return TypedResults.Ok(items);
    })
    .RequireAuthorization();

api.MapDelete(
    "/users/me/history",
    async Task<Results<NoContent, BadRequest>> (ClearHistoryHandler handler, CancellationToken ct) =>
    {
        await handler.Handle(new ClearHistoryCommand(), ct);
        return TypedResults.NoContent();
    })
    .RequireAuthorization();

api.MapGet(
    "/users/me/purchases",
    async Task<Ok<IReadOnlyList<PurchaseItemDto>>> (GetPurchasesHandler handler, CancellationToken ct) =>
    {
        var items = await handler.Handle(ct);
        return TypedResults.Ok(items);
    })
    .RequireAuthorization();

api.MapGet(
    "/users/me/models",
    async Task<Ok<IReadOnlyList<MyModelItemDto>>> (GetMyModelsHandler handler, CancellationToken ct) =>
    {
        var items = await handler.Handle(ct);
        return TypedResults.Ok(items);
    })
    .RequireAuthorization();

api.MapGet(
    "/users/me/contents",
    async Task<Ok<IReadOnlyList<MyContentItemDto>>> (GetMyContentsHandler handler, CancellationToken ct) =>
    {
        var items = await handler.Handle(ct);
        return TypedResults.Ok(items);
    })
    .RequireAuthorization();

api.MapPost(
    "/auth/login",
    async Task<Results<Ok<AuthResultDto>, BadRequest<string>>> (LoginRequest request, LoginHandler handler, CancellationToken ct) =>
    {
        if (string.IsNullOrWhiteSpace(request.Account) || string.IsNullOrWhiteSpace(request.Password))
        {
            return TypedResults.BadRequest("Account and password are required.");
        }

        var result = await handler.Handle(new LoginCommand(request.Account, request.Password), ct);
        return TypedResults.Ok(result);
    });

api.MapPost(
    "/auth/register",
    async Task<Results<Ok<AuthResultDto>, BadRequest<string>>> (RegisterRequest request, RegisterHandler handler, CancellationToken ct) =>
    {
        if (string.IsNullOrWhiteSpace(request.Account) || string.IsNullOrWhiteSpace(request.Password))
        {
            return TypedResults.BadRequest("Account and password are required.");
        }

        var result = await handler.Handle(new RegisterCommand(request.Account, request.Password), ct);
        return TypedResults.Ok(result);
    });

app.Run();

public sealed record LoginRequest(string Account, string Password);

public sealed record RegisterRequest(string Account, string Password);

public sealed record PublishContentRequest(
    string Type,
    string Title,
    string? Cover,
    string? Summary,
    string? Body,
    string? VideoUrl);

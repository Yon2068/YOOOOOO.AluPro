using Microsoft.EntityFrameworkCore;
using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Domain.Authors;
using YOOOOOO.AluPro.Domain.Contents;
using YOOOOOO.AluPro.Domain.Models;

namespace YOOOOOO.AluPro.Infrastructure.Persistence.Repositories;

public sealed class EfAuthorRepository : IAuthorRepository
{
    private readonly AluProDbContext _db;

    public EfAuthorRepository(AluProDbContext db)
    {
        _db = db;
    }

    public Task<Author?> GetById(AuthorId id, CancellationToken ct)
    {
        return _db.Authors.FirstOrDefaultAsync(x => x.Id == id, ct);
    }
}

public sealed class EfModelRepository : IModelRepository
{
    private readonly AluProDbContext _db;

    public EfModelRepository(AluProDbContext db)
    {
        _db = db;
    }

    public Task<ModelAsset?> GetById(ModelId id, CancellationToken ct)
    {
        return _db.Models.FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<IReadOnlyList<ModelAsset>> Search(string? category, string? query, CancellationToken ct)
    {
        var q = _db.Models.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && !string.Equals(category, "all", StringComparison.OrdinalIgnoreCase))
        {
            q = q.Where(x => x.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            q = q.Where(x => x.Title.Contains(query) ||  x.Description.Contains(query));
        }

        return await q.ToListAsync(ct);
    }
}

public sealed class EfContentRepository : IContentRepository
{
    private readonly AluProDbContext _db;

    public EfContentRepository(AluProDbContext db)
    {
        _db = db;
    }

    public Task<ContentItem?> GetById(ContentId id, CancellationToken ct)
    {
        return _db.Content.FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public async Task<IReadOnlyList<ContentItem>> Search(string? type, string? query, CancellationToken ct)
    {
        var q = _db.Content.AsQueryable();

        if (!string.IsNullOrWhiteSpace(type))
        {
            if (Enum.TryParse<ContentType>(type, true, out var typeEnum))
            {
                q = q.Where(x => x.Type == typeEnum);
            }
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            q = q.Where(x => x.Title.Contains(query) || x.Body.Contains(query));
        }

        return await q.ToListAsync(ct);
    }
}

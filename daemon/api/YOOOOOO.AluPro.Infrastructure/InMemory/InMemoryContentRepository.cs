using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Domain.Contents;

namespace YOOOOOO.AluPro.Infrastructure.InMemory;

public sealed class InMemoryContentRepository : IContentRepository
{
    private readonly InMemoryCatalog _catalog;

    public InMemoryContentRepository(InMemoryCatalog catalog)
    {
        _catalog = catalog;
    }

    public Task<IReadOnlyList<ContentItem>> Search(string? type, string? query, CancellationToken ct)
    {
        IEnumerable<ContentItem> items = _catalog.Content;

        if (!string.IsNullOrWhiteSpace(type))
        {
            var normalized = type.Trim().ToLowerInvariant();
            items = normalized switch
            {
                "video" or "videos" => items.Where(c => c.Type == ContentType.Video),
                "article" or "articles" => items.Where(c => c.Type == ContentType.Article),
                _ => items
            };
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.Trim();
            items = items.Where(c => c.Title.Contains(q, StringComparison.OrdinalIgnoreCase));
        }

        return Task.FromResult((IReadOnlyList<ContentItem>)items.ToArray());
    }

    public Task<ContentItem?> GetById(ContentId id, CancellationToken ct)
    {
        var item = _catalog.Content.FirstOrDefault(c => c.Id == id);
        return Task.FromResult(item);
    }
}


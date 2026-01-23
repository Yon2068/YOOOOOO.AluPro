using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Domain.Models;

namespace YOOOOOO.AluPro.Infrastructure.InMemory;

public sealed class InMemoryModelRepository : IModelRepository
{
    private readonly InMemoryCatalog _catalog;

    public InMemoryModelRepository(InMemoryCatalog catalog)
    {
        _catalog = catalog;
    }

    public Task<IReadOnlyList<ModelAsset>> Search(string? category, string? query, CancellationToken ct)
    {
        IEnumerable<ModelAsset> items = _catalog.Models;

        if (!string.IsNullOrWhiteSpace(category) && !string.Equals(category, "all", StringComparison.OrdinalIgnoreCase))
        {
            items = items.Where(m => string.Equals(m.Category, category, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.Trim();
            items = items.Where(m =>
                m.Title.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                m.Tags.Any(t => t.Contains(q, StringComparison.OrdinalIgnoreCase)));
        }

        return Task.FromResult((IReadOnlyList<ModelAsset>)items.ToArray());
    }

    public Task<ModelAsset?> GetById(ModelId id, CancellationToken ct)
    {
        var model = _catalog.Models.FirstOrDefault(m => m.Id == id);
        return Task.FromResult(model);
    }
}


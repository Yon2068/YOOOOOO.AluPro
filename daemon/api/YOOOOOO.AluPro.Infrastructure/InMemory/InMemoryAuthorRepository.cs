using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Domain.Authors;

namespace YOOOOOO.AluPro.Infrastructure.InMemory;

public sealed class InMemoryAuthorRepository : IAuthorRepository
{
    private readonly InMemoryCatalog _catalog;

    public InMemoryAuthorRepository(InMemoryCatalog catalog)
    {
        _catalog = catalog;
    }

    public Task<Author?> GetById(AuthorId id, CancellationToken ct)
    {
        var author = _catalog.Authors.FirstOrDefault(a => a.Id == id);
        return Task.FromResult(author);
    }
}


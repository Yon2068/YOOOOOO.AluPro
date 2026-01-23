using YOOOOOO.AluPro.Domain.Contents;

namespace YOOOOOO.AluPro.Application.Abstractions;

public interface IContentRepository
{
    Task<IReadOnlyList<ContentItem>> Search(string? type, string? query, CancellationToken ct);
    Task<ContentItem?> GetById(ContentId id, CancellationToken ct);
}


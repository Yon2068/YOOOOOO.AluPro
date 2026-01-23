using YOOOOOO.AluPro.Domain.Models;

namespace YOOOOOO.AluPro.Application.Abstractions;

public interface IModelRepository
{
    Task<IReadOnlyList<ModelAsset>> Search(string? category, string? query, CancellationToken ct);
    Task<ModelAsset?> GetById(ModelId id, CancellationToken ct);
}


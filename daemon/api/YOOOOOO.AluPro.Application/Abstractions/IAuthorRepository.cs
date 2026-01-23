using YOOOOOO.AluPro.Domain.Authors;

namespace YOOOOOO.AluPro.Application.Abstractions;

public interface IAuthorRepository
{
    Task<Author?> GetById(AuthorId id, CancellationToken ct);
}


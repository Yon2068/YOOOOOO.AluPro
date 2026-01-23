using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Users;

public sealed record GetFavoritesQuery(string? Type);

public sealed class GetFavoritesHandler
{
    private readonly IUserQueries _users;

    public GetFavoritesHandler(IUserQueries users)
    {
        _users = users;
    }

    public Task<IReadOnlyList<FavoriteItemDto>> Handle(GetFavoritesQuery query, CancellationToken ct)
    {
        var kind = string.IsNullOrWhiteSpace(query.Type) ? "model" : query.Type.Trim();
        return _users.GetFavorites(kind, ct);
    }
}


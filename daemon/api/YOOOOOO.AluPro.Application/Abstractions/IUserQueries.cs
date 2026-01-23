using YOOOOOO.AluPro.Application.Users;

namespace YOOOOOO.AluPro.Application.Abstractions;

public interface IUserQueries
{
    Task<UserDto> GetMe(CancellationToken ct);
    Task<UserDto?> GetUserById(Guid id, CancellationToken ct);
    Task<IReadOnlyList<FavoriteItemDto>> GetFavorites(string kind, CancellationToken ct);
    Task<IReadOnlyList<HistoryGroupDto>> GetHistory(CancellationToken ct);
    Task<IReadOnlyList<PurchaseItemDto>> GetPurchases(CancellationToken ct);
    Task<IReadOnlyList<MyModelItemDto>> GetMyModels(CancellationToken ct);
    Task<IReadOnlyList<MyContentItemDto>> GetMyContents(CancellationToken ct);
}


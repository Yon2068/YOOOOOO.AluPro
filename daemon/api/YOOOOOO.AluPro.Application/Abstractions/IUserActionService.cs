using YOOOOOO.AluPro.Application.Contents;
using YOOOOOO.AluPro.Application.Users;

namespace YOOOOOO.AluPro.Application.Abstractions;

public interface IUserActionService
{
    Task<ToggleResultDto?> ToggleModelFavorite(Guid modelId, CancellationToken ct);
    Task<PurchaseResultDto> PurchaseModel(Guid modelId, CancellationToken ct);
    Task<DownloadResultDto?> DownloadModel(Guid modelId, CancellationToken ct);
    Task<bool> IsPurchased(Guid modelId, CancellationToken ct);
    Task<bool> IsCollected(Guid modelId, CancellationToken ct);
    Task<ToggleResultDto?> ToggleAuthorFollow(Guid authorId, CancellationToken ct);
    Task<ContentDetailDto> PublishContent(PublishContentCommand command, CancellationToken ct);
    Task RecordView(Guid targetId, string targetType, CancellationToken ct);
    Task ClearHistory(CancellationToken ct);
}


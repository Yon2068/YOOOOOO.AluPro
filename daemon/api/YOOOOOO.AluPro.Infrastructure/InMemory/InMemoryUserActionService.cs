using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Application.Contents;
using YOOOOOO.AluPro.Application.Users;
using YOOOOOO.AluPro.Domain.Contents;
using YOOOOOO.AluPro.Domain.Models;

namespace YOOOOOO.AluPro.Infrastructure.InMemory;

public sealed class InMemoryUserActionService : IUserActionService
{
    private readonly InMemoryCatalog _catalog;
    private readonly InMemoryUserState _state;

    public InMemoryUserActionService(InMemoryCatalog catalog, InMemoryUserState state)
    {
        _catalog = catalog;
        _state = state;
    }

    public Task<ToggleResultDto?> ToggleModelFavorite(Guid modelId, CancellationToken ct)
    {
        var exists = _catalog.Models.Any(m => m.Id.Value == modelId);
        if (!exists)
        {
            return Task.FromResult<ToggleResultDto?>(null);
        }

        var isCollected = _state.ToggleFavoriteModel(modelId);
        return Task.FromResult<ToggleResultDto?>(new ToggleResultDto(modelId.ToString(), isCollected));
    }

    public Task<DownloadResultDto?> DownloadModel(Guid modelId, CancellationToken ct)
    {
        var model = _catalog.Models.FirstOrDefault(m => m.Id.Value == modelId);
        if (model is null)
        {
            return Task.FromResult<DownloadResultDto?>(null);
        }

        var downloadUrl = $"https://example.invalid/download/{Uri.EscapeDataString(model.Id.Value.ToString())}";
        return Task.FromResult<DownloadResultDto?>(new DownloadResultDto(model.Id.Value.ToString(), downloadUrl));
    }

    public Task<bool> IsPurchased(Guid modelId, CancellationToken ct)
    {
        return Task.FromResult(false); // Mock
    }

    public Task<bool> IsCollected(Guid modelId, CancellationToken ct)
    {
        return Task.FromResult(false); // Mock
    }

    public Task<ToggleResultDto?> ToggleAuthorFollow(Guid authorId, CancellationToken ct)
    {
        var exists = _catalog.Authors.Any(a => a.Id.Value == authorId);
        if (!exists)
        {
            return Task.FromResult<ToggleResultDto?>(null);
        }

        var isFollowing = _state.ToggleFollowAuthor(authorId);
        return Task.FromResult<ToggleResultDto?>(new ToggleResultDto(authorId.ToString(), isFollowing));
    }

    public Task<PurchaseResultDto> PurchaseModel(Guid modelId, CancellationToken ct)
    {
        return Task.FromResult(new PurchaseResultDto(true, "Mock Purchase", 1000m));
    }

    public Task<ContentDetailDto> PublishContent(PublishContentCommand command, CancellationToken ct)
    {
        var type = string.Equals(command.Type, "video", StringComparison.OrdinalIgnoreCase) ? ContentType.Video : ContentType.Article;
        var contentId = Guid.NewGuid();

        var authorId = _catalog.Authors.First().Id;
        var cover = string.IsNullOrWhiteSpace(command.Cover)
            ? $"https://picsum.photos/800/450?random={Uri.EscapeDataString(contentId.ToString())}"
            : command.Cover!;

        var body = string.IsNullOrWhiteSpace(command.Body) ? (command.Summary ?? "") : command.Body!;
        var summary = string.IsNullOrWhiteSpace(command.Summary) ? null : command.Summary;
        var duration = type == ContentType.Video ? "12:34" : null;
        var tags = type == ContentType.Video
            ? new[] { "视频", "教程" }
            : new[] { "文章", "灵感" };

        var item = new ContentItem(
            new ContentId(contentId),
            type,
            command.Title.Trim(),
            cover,
            authorId,
            0,
            0,
            0,
            summary,
            duration,
            DateTime.UtcNow.ToString("yyyy-MM-dd"),
            tags,
            command.VideoUrl,
            body);

        _catalog.AddContent(item);
        _state.AddMyContent(contentId);

        var author = _catalog.Authors.First(a => a.Id == authorId);

        var dto = new ContentDetailDto(
            item.Id.Value.ToString(),
            type == ContentType.Video ? "video" : "article",
            item.Title,
            item.CoverUrl,
            author.Id.Value.ToString(),
            author.Name,
            author.AvatarUrl,
            new ContentStatsDto(item.Likes, item.Views, item.Comments),
            item.PublishDate,
            item.Tags,
            item.Body,
            item.VideoUrl,
            item.Duration);

        return Task.FromResult(dto);
    }

    public Task RecordView(Guid targetId, string targetType, CancellationToken ct)
    {
        // No-op for in-memory service or just log
        return Task.CompletedTask;
    }

    public Task ClearHistory(CancellationToken ct)
    {
        return Task.CompletedTask;
    }
}


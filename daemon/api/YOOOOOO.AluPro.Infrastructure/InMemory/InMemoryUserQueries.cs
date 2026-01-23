using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Application.Users;

namespace YOOOOOO.AluPro.Infrastructure.InMemory;

public sealed class InMemoryUserQueries : IUserQueries
{
    private readonly InMemoryCatalog _catalog;
    private readonly InMemoryUserState _state;

    public InMemoryUserQueries(InMemoryCatalog catalog, InMemoryUserState state)
    {
        _catalog = catalog;
        _state = state;
    }

    public Task<UserDto> GetMe(CancellationToken ct)
        => Task.FromResult(new UserDto(_catalog.Me.Id.Value.ToString(), _catalog.Me.Nickname, _catalog.Me.AvatarUrl, _catalog.Me.VipLevel, _catalog.Me.Balance));

    public Task<UserDto?> GetUserById(Guid id, CancellationToken ct)
    {
        // Mock
        return Task.FromResult<UserDto?>(null);
    }

    public Task<IReadOnlyList<FavoriteItemDto>> GetFavorites(string kind, CancellationToken ct)
    {
        var typeText = string.Equals(kind, "content", StringComparison.OrdinalIgnoreCase) ? "文章" : "模型";
        var coverBase = typeText == "模型" ? 400 : 500;

        FavoriteItemDto[] items;

        if (typeText == "模型")
        {
            items = _state
                .GetFavoriteModelIds()
                .Select((id, index) =>
                {
                    var model = _catalog.Models.FirstOrDefault(m => m.Id.Value == id);
                    if (model is null)
                    {
                        return null;
                    }

                    var author = _catalog.Authors.FirstOrDefault(a => a.Id == model.AuthorId);
                    var authorName = author?.Name ?? "Unknown";

                    return new FavoriteItemDto(
                        $"fav-model-{id}",
                        model.Title,
                        model.CoverUrl,
                        authorName,
                        "默认收藏夹",
                        "2024-03-19",
                        "模型");
                })
                .Where(x => x is not null)
                .Cast<FavoriteItemDto>()
                .ToArray();
        }
        else
        {
            items = Enumerable.Range(0, 6)
                .Select(i => new FavoriteItemDto(
                    $"fav-{kind}-{i}",
                    $"设计灵感周刊 Vol.{i + 1}",
                    $"https://picsum.photos/400/300?random={i + coverBase}",
                    $"创作者 {Convert.ToChar(65 + i)}",
                    "默认收藏夹",
                    "2024-03-19",
                    "文章"))
                .ToArray();
        }

        return Task.FromResult((IReadOnlyList<FavoriteItemDto>)items);
    }

    public Task<IReadOnlyList<HistoryGroupDto>> GetHistory(CancellationToken ct)
    {
        var groups = new[]
        {
            new HistoryGroupDto(
                "今天",
                Enumerable.Range(0, 3)
                    .Select(i => new HistoryItemDto(
                        $"today-{i}",
                        $"未来主义城市建筑概念 {i + 1}",
                        $"https://picsum.photos/400/300?random={i + 600}",
                        $"Studio {i}",
                        "10:30",
                        "model"))
                    .ToArray()),
            new HistoryGroupDto(
                "昨天",
                Enumerable.Range(0, 4)
                    .Select(i => new HistoryItemDto(
                        $"yesterday-{i}",
                        $"Unity 游戏开发实战教程 {i + 1}",
                        $"https://picsum.photos/400/300?random={i + 700}",
                        "Dev Master",
                        "14:20",
                        "video"))
                    .ToArray()),
            new HistoryGroupDto(
                "更早",
                Enumerable.Range(0, 5)
                    .Select(i => new HistoryItemDto(
                        $"earlier-{i}",
                        $"UI 设计规范与系统搭建 {i + 1}",
                        $"https://picsum.photos/400/300?random={i + 800}",
                        "UI Pro",
                        "09:15",
                        "article"))
                    .ToArray())
        };

        return Task.FromResult((IReadOnlyList<HistoryGroupDto>)groups);
    }

    public Task<IReadOnlyList<PurchaseItemDto>> GetPurchases(CancellationToken ct)
    {
         // Mock implementation
        var items = Enumerable.Range(0, 5)
            .Select(i => new PurchaseItemDto(
                $"dl-{i}",
                $"高精度建筑模型合集 Vol.{i + 1}",
                $"https://picsum.photos/400/300?random={i + 300}",
                $"设计师 {Convert.ToChar(65 + i)}",
                "100 MB",
                "2024-03-20 14:30",
                "FBX"))
            .ToArray();

        return Task.FromResult((IReadOnlyList<PurchaseItemDto>)items);
    }

    public Task<IReadOnlyList<MyModelItemDto>> GetMyModels(CancellationToken ct)
    {
        var items = Enumerable.Range(0, 8)
            .Select(i => new MyModelItemDto(
                $"auth-{i}",
                $"已授权模型示例 {i + 1}",
                $"https://picsum.photos/400/300?random={i + 100}",
                "2024-03-20",
                1200 + i * 10,
                56 + i,
                i % 2 == 0 ? "已上架" : "审核中"))
            .ToArray();

        return Task.FromResult((IReadOnlyList<MyModelItemDto>)items);
    }

    public Task<IReadOnlyList<MyContentItemDto>> GetMyContents(CancellationToken ct)
    {
        var items = new List<MyContentItemDto>
        {
            new MyContentItemDto("my-article-1", "article", "设计灵感：光影的艺术", "https://picsum.photos/400/300?random=my-article-1", "2024-03-19", 3200, 210),
            new MyContentItemDto("my-video-1", "video", "Blender 渲染进阶教程", "https://picsum.photos/400/225?random=my-video-1", "2024-03-18", 8600, 520)
        };

        foreach (var id in _state.GetMyContentIds())
        {
            var content = _catalog.Content.FirstOrDefault(c => c.Id.Value == id);
            if (content is null)
            {
                continue;
            }

            items.Add(new MyContentItemDto(content.Id.Value.ToString(), content.Type == YOOOOOO.AluPro.Domain.Contents.ContentType.Video ? "video" : "article", content.Title, content.CoverUrl, content.PublishDate, content.Views, content.Likes));
        }

        return Task.FromResult((IReadOnlyList<MyContentItemDto>)items.ToArray());
    }
}

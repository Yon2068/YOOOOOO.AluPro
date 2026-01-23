using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Domain.Contents;

namespace YOOOOOO.AluPro.Application.Contents;

public sealed record GetContentByIdQuery(Guid Id);

public sealed class GetContentByIdHandler
{
    private readonly IContentRepository _contents;
    private readonly IAuthorRepository _authors;
    private readonly IUserActionService _userActions;

    public GetContentByIdHandler(IContentRepository contents, IAuthorRepository authors, IUserActionService userActions)
    {
        _contents = contents;
        _authors = authors;
        _userActions = userActions;
    }

    public async Task<ContentDetailDto?> Handle(GetContentByIdQuery query, CancellationToken ct)
    {
        var item = await _contents.GetById(new ContentId(query.Id), ct);
        if (item is null)
        {
            return null;
        }

        // Record view asynchronously (fire and forget? No, better await to ensure consistency or use background job)
        // For simplicity, await.
        await _userActions.RecordView(query.Id, item.Type == ContentType.Video ? "video" : "article", ct);

        var author = await _authors.GetById(item.AuthorId, ct);
        var authorId = author?.Id.Value.ToString() ?? "unknown";
        var authorName = author?.Name ?? "Unknown";
        var authorAvatar = author?.AvatarUrl ?? "";

        return new ContentDetailDto(
            item.Id.Value.ToString(),
            item.Type == ContentType.Video ? "video" : "article",
            item.Title,
            item.CoverUrl,
            authorId,
            authorName,
            authorAvatar,
            new ContentStatsDto(item.Likes, item.Views, item.Comments),
            item.PublishDate,
            item.Tags,
            item.Body,
            item.VideoUrl,
            item.Duration);
    }
}


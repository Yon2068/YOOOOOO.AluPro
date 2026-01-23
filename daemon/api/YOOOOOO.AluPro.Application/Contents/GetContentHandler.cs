using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Domain.Contents;

namespace YOOOOOO.AluPro.Application.Contents;

public sealed record GetContentQuery(string? Type, string? Query);

public sealed class GetContentHandler
{
    private readonly IContentRepository _contents;
    private readonly IAuthorRepository _authors;

    public GetContentHandler(IContentRepository contents, IAuthorRepository authors)
    {
        _contents = contents;
        _authors = authors;
    }

    public async Task<IReadOnlyList<ContentCardDto>> Handle(GetContentQuery query, CancellationToken ct)
    {
        var items = await _contents.Search(query.Type, query.Query, ct);

        var result = new List<ContentCardDto>(items.Count);
        foreach (var item in items)
        {
            var author = await _authors.GetById(item.AuthorId, ct);
            var authorId = author?.Id.Value.ToString() ?? item.AuthorId.Value.ToString();
            var authorName = author?.Name ?? "Unknown";
            var authorAvatar = author?.AvatarUrl ?? "";

            result.Add(
                new ContentCardDto(
                    item.Id.Value.ToString(),
                    item.Type == ContentType.Video ? "video" : "article",
                    item.Title,
                    item.CoverUrl,
                    authorId,
                    authorName,
                    authorAvatar,
                    new ContentStatsDto(item.Likes, item.Views, item.Comments),
                    item.Summary,
                    item.Duration,
                    item.PublishDate,
                    item.Tags));
        }

        return result;
    }
}


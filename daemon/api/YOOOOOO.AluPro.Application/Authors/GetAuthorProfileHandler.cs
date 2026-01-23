using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Domain.Authors;
using YOOOOOO.AluPro.Domain.Contents;

namespace YOOOOOO.AluPro.Application.Authors;

public sealed record GetAuthorProfileQuery(Guid Id);

public sealed class GetAuthorProfileHandler
{
    private readonly IAuthorRepository _authors;
    private readonly IModelRepository _models;
    private readonly IContentRepository _contents;

    public GetAuthorProfileHandler(IAuthorRepository authors, IModelRepository models, IContentRepository contents)
    {
        _authors = authors;
        _models = models;
        _contents = contents;
    }

    public async Task<AuthorProfileDto?> Handle(GetAuthorProfileQuery query, CancellationToken ct)
    {
        var author = await _authors.GetById(new AuthorId(query.Id), ct);
        if (author is null)
        {
            return null;
        }

        var allModels = await _models.Search(null, null, ct);
        var models = allModels
            .Where(m => m.AuthorId == author.Id)
            .Take(6)
            .Select(m => new AuthorWorkModelDto(m.Id.Value.ToString(), m.Title, m.CoverUrl, m.Likes, m.IsFree))
            .ToArray();

        var allContent = await _contents.Search(null, null, ct);
        var content = allContent
            .Where(c => c.AuthorId == author.Id)
            .Take(6)
            .Select(c => new AuthorWorkContentDto(
                c.Id.Value.ToString(),
                c.Type == ContentType.Video ? "video" : "article",
                c.Title,
                c.CoverUrl,
                c.Views,
                c.Duration))
            .ToArray();

        var dto = new AuthorInfoDto(
            author.Id.Value.ToString(),
            author.Name,
            author.AvatarUrl,
            author.CoverUrl,
            author.Bio,
            author.Location,
            author.Website,
            author.JoinDate,
            new AuthorStatsDto("12.5k", "234", "45.2k", "1.2m"),
            new[] { "3D Modeling", "Game Art", "Architecture", "Motion Design" });

        return new AuthorProfileDto(dto, models, content);
    }
}


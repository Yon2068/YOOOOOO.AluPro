using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Models;

public sealed record GetModelsQuery(string? Category, string? Query);

public sealed class GetModelsHandler
{
    private readonly IModelRepository _models;
    private readonly IAuthorRepository _authors;

    public GetModelsHandler(IModelRepository models, IAuthorRepository authors)
    {
        _models = models;
        _authors = authors;
    }

    public async Task<IReadOnlyList<ModelCardDto>> Handle(GetModelsQuery query, CancellationToken ct)
    {
        var items = await _models.Search(query.Category, query.Query, ct);

        var result = new List<ModelCardDto>(items.Count);
        foreach (var model in items)
        {
            var author = await _authors.GetById(model.AuthorId, ct);
            var authorDto = author is null
                ? new AuthorSummaryDto(model.AuthorId.Value.ToString(), "Unknown", "")
                : new AuthorSummaryDto(author.Id.Value.ToString(), author.Name, author.AvatarUrl);

            result.Add(
                new ModelCardDto(
                    model.Id.Value.ToString(),
                    model.Title,
                    model.CoverUrl,
                    authorDto,
                    model.IsHot,
                    model.IsFree,
                    false,
                    model.UploadDate,
                    model.Category));
        }

        return result;
    }
}


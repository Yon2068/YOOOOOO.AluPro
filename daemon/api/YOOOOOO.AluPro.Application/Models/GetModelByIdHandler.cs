using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Domain.Models;

namespace YOOOOOO.AluPro.Application.Models;

public sealed record GetModelByIdQuery(Guid Id);

public sealed class GetModelByIdHandler
{
    private readonly IModelRepository _models;
    private readonly IAuthorRepository _authors;
    private readonly IUserActionService _userActions;

    public GetModelByIdHandler(IModelRepository models, IAuthorRepository authors, IUserActionService userActions)
    {
        _models = models;
        _authors = authors;
        _userActions = userActions;
    }

    public async Task<ModelDetailDto?> Handle(GetModelByIdQuery query, CancellationToken ct)
    {
        var model = await _models.GetById(new ModelId(query.Id), ct);
        if (model is null)
        {
            return null;
        }

        await _userActions.RecordView(query.Id, "model", ct);
        var isPurchased = await _userActions.IsPurchased(query.Id, ct);
        var isCollected = await _userActions.IsCollected(query.Id, ct);

        var author = await _authors.GetById(model.AuthorId, ct);
        var authorDto = author is null
            ? new AuthorSummaryDto(model.AuthorId.Value.ToString(), "Unknown", "")
            : new AuthorSummaryDto(author.Id.Value.ToString(), author.Name, author.AvatarUrl);

        var specs = model.Specs.Select(s => new ModelSpecDto(s.Label, s.Value)).ToArray();

        return new ModelDetailDto(
            model.Id.Value.ToString(),
            model.Title,
            model.Description,
            model.ImageUrls,
            authorDto,
            specs,
            model.Tags,
            model.UploadDate,
            model.Downloads,
            model.Likes,
            model.Size,
            model.IsFree,
            model.Price,
            isPurchased,
            isCollected);
    }
}


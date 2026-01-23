using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Contents;

public sealed record PublishContentCommand(
    string Type,
    string Title,
    string? Cover,
    string? Summary,
    string? Body,
    string? VideoUrl);

public sealed class PublishContentHandler
{
    private readonly IUserActionService _actions;

    public PublishContentHandler(IUserActionService actions)
    {
        _actions = actions;
    }

    public Task<ContentDetailDto> Handle(PublishContentCommand command, CancellationToken ct)
        => _actions.PublishContent(command, ct);
}


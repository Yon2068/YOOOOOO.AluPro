using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Application.Users;

namespace YOOOOOO.AluPro.Application.Models;

public sealed record ToggleModelFavoriteCommand(Guid Id);

public sealed class ToggleModelFavoriteHandler
{
    private readonly IUserActionService _userActionService;

    public ToggleModelFavoriteHandler(IUserActionService userActionService)
    {
        _userActionService = userActionService;
    }

    public Task<ToggleResultDto?> Handle(ToggleModelFavoriteCommand command, CancellationToken ct) => _userActionService.ToggleModelFavorite(command.Id, ct);
}


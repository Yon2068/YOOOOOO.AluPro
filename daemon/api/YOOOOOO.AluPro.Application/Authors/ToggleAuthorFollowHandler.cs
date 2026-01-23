using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Application.Users;

namespace YOOOOOO.AluPro.Application.Authors;

public sealed record ToggleAuthorFollowCommand(Guid Id);

public sealed class ToggleAuthorFollowHandler
{
    private readonly IUserActionService _userActionService;
    public ToggleAuthorFollowHandler(IUserActionService userActionService) => _userActionService = userActionService;
    public Task<ToggleResultDto?> Handle(ToggleAuthorFollowCommand command, CancellationToken ct) => _userActionService.ToggleAuthorFollow(command.Id, ct);
}


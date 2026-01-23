using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Users;

public sealed record ClearHistoryCommand();

public sealed class ClearHistoryHandler
{
    private readonly IUserActionService _userActions;

    public ClearHistoryHandler(IUserActionService userActions)
    {
        _userActions = userActions;
    }

    public async Task Handle(ClearHistoryCommand command, CancellationToken ct)
    {
        await _userActions.ClearHistory(ct);
    }
}

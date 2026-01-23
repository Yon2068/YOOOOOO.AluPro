using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Users;

public sealed record PurchaseModelCommand(Guid ModelId);

public sealed class PurchaseModelHandler
{
    private readonly IUserActionService _userActions;

    public PurchaseModelHandler(IUserActionService userActions)
    {
        _userActions = userActions;
    }

    public async Task<PurchaseResultDto> Handle(PurchaseModelCommand command, CancellationToken ct)
    {
        return await _userActions.PurchaseModel(command.ModelId, ct);
    }
}

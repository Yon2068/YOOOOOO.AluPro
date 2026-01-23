using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Users;

public sealed class GetPurchasesHandler
{
    private readonly IUserQueries _users;

    public GetPurchasesHandler(IUserQueries users)
    {
        _users = users;
    }

    public Task<IReadOnlyList<PurchaseItemDto>> Handle(CancellationToken ct) => _users.GetPurchases(ct);
}


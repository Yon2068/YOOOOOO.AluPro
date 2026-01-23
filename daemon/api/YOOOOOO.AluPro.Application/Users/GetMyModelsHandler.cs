using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Users;

public sealed class GetMyModelsHandler
{
    private readonly IUserQueries _users;

    public GetMyModelsHandler(IUserQueries users)
    {
        _users = users;
    }

    public Task<IReadOnlyList<MyModelItemDto>> Handle(CancellationToken ct) => _users.GetMyModels(ct);
}


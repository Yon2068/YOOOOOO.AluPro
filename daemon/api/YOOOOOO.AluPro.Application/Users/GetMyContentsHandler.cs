using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Users;

public sealed class GetMyContentsHandler
{
    private readonly IUserQueries _users;

    public GetMyContentsHandler(IUserQueries users)
    {
        _users = users;
    }

    public Task<IReadOnlyList<MyContentItemDto>> Handle(CancellationToken ct) => _users.GetMyContents(ct);
}


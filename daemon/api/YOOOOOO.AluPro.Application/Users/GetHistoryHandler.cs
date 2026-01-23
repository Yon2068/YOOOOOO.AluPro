using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Users;

public sealed class GetHistoryHandler
{
    private readonly IUserQueries _users;

    public GetHistoryHandler(IUserQueries users)
    {
        _users = users;
    }

    public Task<IReadOnlyList<HistoryGroupDto>> Handle(CancellationToken ct) => _users.GetHistory(ct);
}


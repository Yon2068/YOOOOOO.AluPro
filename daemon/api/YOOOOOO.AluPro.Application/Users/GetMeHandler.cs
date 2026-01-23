using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Users;

public sealed class GetMeHandler
{
    private readonly IUserQueries _users;

    public GetMeHandler(IUserQueries users)
    {
        _users = users;
    }

    public Task<UserDto> Handle(CancellationToken ct) => _users.GetMe(ct);
}


using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Application.Auth;

namespace YOOOOOO.AluPro.Infrastructure.InMemory;

public sealed class InMemoryAuthService : IAuthService
{
    private readonly IUserQueries _users;

    public InMemoryAuthService(IUserQueries users)
    {
        _users = users;
    }

    public async Task<AuthResultDto> Login(string account, string password, CancellationToken ct)
    {
        var user = await _users.GetMe(ct);
        return new AuthResultDto(Guid.NewGuid().ToString("N"), user);
    }

    public async Task<AuthResultDto> Register(string account, string password, CancellationToken ct)
    {
        var user = await _users.GetMe(ct);
        return new AuthResultDto(Guid.NewGuid().ToString("N"), user);
    }
}


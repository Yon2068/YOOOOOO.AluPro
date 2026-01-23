using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Auth;

public sealed record LoginCommand(string Account, string Password);

public sealed class LoginHandler
{
    private readonly IAuthService _auth;

    public LoginHandler(IAuthService auth)
    {
        _auth = auth;
    }

    public Task<AuthResultDto> Handle(LoginCommand command, CancellationToken ct)
        => _auth.Login(command.Account, command.Password, ct);
}


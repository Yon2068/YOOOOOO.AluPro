using YOOOOOO.AluPro.Application.Abstractions;

namespace YOOOOOO.AluPro.Application.Auth;

public sealed record RegisterCommand(string Account, string Password);

public sealed class RegisterHandler
{
    private readonly IAuthService _auth;

    public RegisterHandler(IAuthService auth)
    {
        _auth = auth;
    }

    public Task<AuthResultDto> Handle(RegisterCommand command, CancellationToken ct)
        => _auth.Register(command.Account, command.Password, ct);
}


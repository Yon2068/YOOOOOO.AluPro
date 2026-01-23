using YOOOOOO.AluPro.Application.Auth;

namespace YOOOOOO.AluPro.Application.Abstractions;

public interface IAuthService
{
    Task<AuthResultDto> Login(string account, string password, CancellationToken ct);
    Task<AuthResultDto> Register(string account, string password, CancellationToken ct);
}


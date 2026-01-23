using YOOOOOO.AluPro.Application.Users;

namespace YOOOOOO.AluPro.Application.Auth;

public sealed record AuthResultDto(string Token, UserDto User);


using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Application.Auth;
using YOOOOOO.AluPro.Application.Users;
using YOOOOOO.AluPro.Domain.Users;

namespace YOOOOOO.AluPro.Infrastructure.Persistence.Repositories;

public sealed class EfAuthService : IAuthService
{
    private readonly AluProDbContext _db;
    private readonly IConfiguration _configuration;

    public EfAuthService(AluProDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    public async Task<AuthResultDto> Login(string account, string password, CancellationToken ct)
    {
        // In a real app, 'account' could be email or username.
        // Assuming 'account' is nickname for now, or we need to add Username/Email to UserProfile.
        // For demo, let's assume nickname is unique enough or we just check nickname.
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Nickname == account, ct);

        if (user is null || user.PasswordHash != password) // Plain text comparison for demo
        {
            // Fallback: check if account is "admin" for testing
            if (account == "admin" && password == "admin")
            {
                // Return a mock admin user if not found in DB
                return new AuthResultDto(GenerateJwtToken(Guid.NewGuid().ToString(), "admin"), 
                    new UserDto("admin-id", "Admin", "", 10, 999999));
            }
            
            throw new Exception("Invalid account or password.");
        }

        var token = GenerateJwtToken(user.Id.Value.ToString(), user.Nickname);
        return new AuthResultDto(token, new UserDto(
            user.Id.Value.ToString(),
            user.Nickname,
            user.AvatarUrl,
            user.VipLevel,
            user.Balance));
    }

    public async Task<AuthResultDto> Register(string account, string password, CancellationToken ct)
    {
        if (await _db.Users.AnyAsync(u => u.Nickname == account, ct))
        {
            throw new Exception("User already exists.");
        }

        var userId = new UserId(Guid.NewGuid());
        var user = new UserProfile(
            userId,
            account,
            $"https://i.pravatar.cc/150?u={userId.Value}",
            1,
            0,
            password // Plain text for demo
        );

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        var token = GenerateJwtToken(user.Id.Value.ToString(), user.Nickname);
        return new AuthResultDto(token, new UserDto(
            user.Id.Value.ToString(),
            user.Nickname,
            user.AvatarUrl,
            user.VipLevel,
            user.Balance));
    }

    private string GenerateJwtToken(string userId, string userName)
    {
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, userName)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

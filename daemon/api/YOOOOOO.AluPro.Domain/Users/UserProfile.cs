namespace YOOOOOO.AluPro.Domain.Users;

public sealed class UserProfile
{
    public UserId Id { get; private set; }
    public string Nickname { get; private set; }
    public string AvatarUrl { get; private set; }
    public int VipLevel { get; private set; }
    public decimal Balance { get; private set; }
    public string PasswordHash { get; private set; }

#pragma warning disable CS8618
    private UserProfile() { }
#pragma warning restore CS8618

    public UserProfile(UserId id, string nickname, string avatarUrl, int vipLevel, decimal balance, string passwordHash)
    {
        Id = id;
        Nickname = nickname;
        AvatarUrl = avatarUrl;
        VipLevel = vipLevel;
        Balance = balance;
        PasswordHash = passwordHash;
    }
}


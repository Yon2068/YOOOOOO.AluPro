namespace YOOOOOO.AluPro.Domain.Authors;

public sealed class Author
{
    public AuthorId Id { get; private set; }
    public string Name { get; private set; }
    public string AvatarUrl { get; private set; }
    public string CoverUrl { get; private set; }
    public string Bio { get; private set; }
    public string Location { get; private set; }
    public string Website { get; private set; }
    public string JoinDate { get; private set; }

#pragma warning disable CS8618
    private Author() { }
#pragma warning restore CS8618

    public Author(
        AuthorId id,
        string name,
        string avatarUrl,
        string coverUrl,
        string bio,
        string location,
        string website,
        string joinDate)
    {
        Id = id;
        Name = name;
        AvatarUrl = avatarUrl;
        CoverUrl = coverUrl;
        Bio = bio;
        Location = location;
        Website = website;
        JoinDate = joinDate;
    }
}


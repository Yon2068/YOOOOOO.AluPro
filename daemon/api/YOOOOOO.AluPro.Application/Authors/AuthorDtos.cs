namespace YOOOOOO.AluPro.Application.Authors;

public sealed record AuthorStatsDto(string Followers, string Following, string Likes, string Views);

public sealed record AuthorInfoDto(
    string Id,
    string Name,
    string Avatar,
    string Cover,
    string Bio,
    string Location,
    string Website,
    string JoinDate,
    AuthorStatsDto Stats,
    IReadOnlyList<string> Tags);

public sealed record AuthorWorkModelDto(string Id, string Title, string Cover, int Likes, bool IsFree);

public sealed record AuthorWorkContentDto(
    string Id,
    string Type,
    string Title,
    string Cover,
    int Views,
    string? Duration);

public sealed record AuthorProfileDto(
    AuthorInfoDto Author,
    IReadOnlyList<AuthorWorkModelDto> Models,
    IReadOnlyList<AuthorWorkContentDto> Content);


namespace YOOOOOO.AluPro.Application.Contents;

public sealed record ContentStatsDto(int Likes, int Views, int Comments);

public sealed record ContentCardDto(
    string Id,
    string Type,
    string Title,
    string Cover,
    string AuthorId,
    string AuthorName,
    string AuthorAvatar,
    ContentStatsDto Stats,
    string? Summary,
    string? Duration,
    string PublishDate,
    IReadOnlyList<string> Tags);

public sealed record ContentDetailDto(
    string Id,
    string Type,
    string Title,
    string Cover,
    string AuthorId,
    string AuthorName,
    string AuthorAvatar,
    ContentStatsDto Stats,
    string PublishDate,
    IReadOnlyList<string> Tags,
    string Body,
    string? VideoUrl,
    string? Duration);


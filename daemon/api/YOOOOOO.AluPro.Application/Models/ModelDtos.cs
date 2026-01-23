namespace YOOOOOO.AluPro.Application.Models;

public sealed record AuthorSummaryDto(string Id, string Name, string Avatar);

public sealed record ModelCardDto(
    string Id,
    string Title,
    string Cover,
    AuthorSummaryDto Author,
    bool IsHot,
    bool IsFree,
    bool IsCollected,
    string UploadTime,
    string Category);

public sealed record ModelSpecDto(string Label, string Value);

public sealed record ModelDetailDto(
    string Id,
    string Title,
    string Description,
    IReadOnlyList<string> Images,
    AuthorSummaryDto Author,
    IReadOnlyList<ModelSpecDto> Specs,
    IReadOnlyList<string> Tags,
    string UploadTime,
    int Downloads,
    int Likes,
    string Size,
    bool IsFree,
    decimal Price,
    bool IsPurchased,
    bool IsCollected);


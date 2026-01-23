namespace YOOOOOO.AluPro.Application.Users;

public sealed record UserDto(string Id, string Nickname, string Avatar, int VipLevel, decimal Balance);

public sealed record FavoriteItemDto(
    string Id,
    string Title,
    string Cover,
    string Author,
    string Folder,
    string Date,
    string Type);

public sealed record HistoryItemDto(string Id, string Title, string Cover, string Author, string Time, string Type);

public sealed record HistoryGroupDto(string Date, IReadOnlyList<HistoryItemDto> Items);

public sealed record PurchaseItemDto(
    string Id,
    string Title,
    string Cover,
    string Author,
    string Size,
    string PurchaseDate,
    string Format);

public sealed record MyModelItemDto(
    string Id,
    string Title,
    string Cover,
    string UploadDate,
    int Views,
    int Likes,
    string Status);

public sealed record MyContentItemDto(
    string Id,
    string Type,
    string Title,
    string Cover,
    string PublishDate,
    int Views,
    int Likes);


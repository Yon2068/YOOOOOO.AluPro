using YOOOOOO.AluPro.Domain.Authors;

namespace YOOOOOO.AluPro.Domain.Contents;

public sealed class ContentItem
{
    public ContentId Id { get; private set; }
    public ContentType Type { get; private set; }
    public string Title { get; private set; }
    public string CoverUrl { get; private set; }
    public AuthorId AuthorId { get; private set; }
    public int Likes { get; private set; }
    public int Views { get; private set; }
    public int Comments { get; private set; }
    public string? Summary { get; private set; }
    public string? Duration { get; private set; }
    public string PublishDate { get; private set; }
    public string[] Tags { get; private set; }
    public string? VideoUrl { get; private set; }
    public string Body { get; private set; }

#pragma warning disable CS8618
    private ContentItem() { }
#pragma warning restore CS8618

    public ContentItem(
        ContentId id,
        ContentType type,
        string title,
        string coverUrl,
        AuthorId authorId,
        int likes,
        int views,
        int comments,
        string? summary,
        string? duration,
        string publishDate,
        string[] tags,
        string? videoUrl,
        string body)
    {
        Id = id;
        Type = type;
        Title = title;
        CoverUrl = coverUrl;
        AuthorId = authorId;
        Likes = likes;
        Views = views;
        Comments = comments;
        Summary = summary;
        Duration = duration;
        PublishDate = publishDate;
        Tags = tags;
        VideoUrl = videoUrl;
        Body = body;
    }
}


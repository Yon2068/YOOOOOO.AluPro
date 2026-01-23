using YOOOOOO.AluPro.Domain.Authors;

namespace YOOOOOO.AluPro.Domain.Models;

public sealed class ModelAsset
{
    public ModelId Id { get; private set; }
    public string Title { get; private set; }
    public string Description { get; private set; }
    public string CoverUrl { get; private set; }
    public IReadOnlyList<string> ImageUrls { get; private set; }
    public AuthorId AuthorId { get; private set; }
    public IReadOnlyList<ModelSpec> Specs { get; private set; }
    public IReadOnlyList<string> Tags { get; private set; }
    public string UploadDate { get; private set; }
    public string Category { get; private set; }
    public bool IsHot { get; private set; }
    public bool IsFree { get; private set; }
    public decimal Price { get; private set; }
    public int Downloads { get; private set; }
    public int Views { get; private set; }
    public int Likes { get; private set; }
    public string Size { get; private set; }

#pragma warning disable CS8618
    private ModelAsset() { }
#pragma warning restore CS8618

    public ModelAsset(
        ModelId id,
        string title,
        string description,
        string coverUrl,
        IReadOnlyList<string> imageUrls,
        AuthorId authorId,
        IReadOnlyList<ModelSpec> specs,
        IReadOnlyList<string> tags,
        string uploadDate,
        string category,
        bool isHot,
        bool isFree,
        decimal price,
        int downloads,
        int views,
        int likes,
        string size)
    {
        Id = id;
        Title = title;
        Description = description;
        CoverUrl = coverUrl;
        ImageUrls = imageUrls;
        AuthorId = authorId;
        Specs = specs;
        Tags = tags;
        UploadDate = uploadDate;
        Category = category;
        IsHot = isHot;
        IsFree = isFree;
        Price = price;
        Downloads = downloads;
        Views = views;
        Likes = likes;
        Size = size;
    }
}


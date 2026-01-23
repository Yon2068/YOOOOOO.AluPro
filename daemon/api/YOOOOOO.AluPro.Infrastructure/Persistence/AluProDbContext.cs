using Microsoft.EntityFrameworkCore;
using YOOOOOO.AluPro.Domain.Authors;
using YOOOOOO.AluPro.Domain.Contents;
using YOOOOOO.AluPro.Domain.Models;
using YOOOOOO.AluPro.Domain.Users;

namespace YOOOOOO.AluPro.Infrastructure.Persistence;

public sealed class AluProDbContext : DbContext
{
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<ModelAsset> Models => Set<ModelAsset>();
    public DbSet<ContentItem> Content => Set<ContentItem>();
    public DbSet<UserProfile> Users => Set<UserProfile>();

    // Shadow tables for user actions
    public DbSet<UserFavoriteModel> UserFavorites => Set<UserFavoriteModel>();
    public DbSet<UserFollowAuthor> UserFollows => Set<UserFollowAuthor>();
    public DbSet<UserMyContent> UserMyContents => Set<UserMyContent>();
    public DbSet<UserMyModel> UserMyModels => Set<UserMyModel>();
    public DbSet<UserPurchase> UserPurchases => Set<UserPurchase>();
    public DbSet<UserViewHistory> UserViews => Set<UserViewHistory>();

    public AluProDbContext(DbContextOptions<AluProDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AluProDbContext).Assembly);
    }
}

// Auxiliary entities for user actions
public sealed class UserFavoriteModel
{
    public Guid UserId { get; set; }
    public Guid ModelId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class UserFollowAuthor
{
    public Guid UserId { get; set; }
    public Guid AuthorId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class UserMyContent
{
    public Guid UserId { get; set; }
    public Guid ContentId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class UserMyModel
{
    public Guid UserId { get; set; }
    public Guid ModelId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class UserPurchase
{
    public Guid UserId { get; set; }
    public Guid ModelId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PurchasedAt { get; set; }
}

public sealed class UserViewHistory
{
    public int Id { get; set; } // Auto-inc primary key might be better for history to allow multiple views
    public Guid UserId { get; set; }
    public Guid TargetId { get; set; }
    public string TargetType { get; set; } // "model", "article", "video"
    public DateTime ViewedAt { get; set; }
}

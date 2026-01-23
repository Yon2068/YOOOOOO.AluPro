using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using YOOOOOO.AluPro.Domain.Authors;
using YOOOOOO.AluPro.Domain.Contents;
using YOOOOOO.AluPro.Domain.Models;
using YOOOOOO.AluPro.Domain.Users;

namespace YOOOOOO.AluPro.Infrastructure.Persistence.Configurations;

public sealed class AuthorConfiguration : IEntityTypeConfiguration<Author>
{
    public void Configure(EntityTypeBuilder<Author> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasConversion(id => id.Value, value => new AuthorId(value));
    }
}

public sealed class ModelAssetConfiguration : IEntityTypeConfiguration<ModelAsset>
{
    public void Configure(EntityTypeBuilder<ModelAsset> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasConversion(id => id.Value, value => new ModelId(value));

        builder.Property(x => x.AuthorId)
            .HasConversion(id => id.Value, value => new AuthorId(value));

        builder.OwnsMany(x => x.Specs, sb =>
        {
            sb.ToJson();
        });
        
        builder.Property(x => x.ImageUrls).HasMaxLength(4000)
            .HasConversion(
                v => string.Join(";", v),
                v => v.Split(";", StringSplitOptions.RemoveEmptyEntries));

        builder.Property(x => x.Tags).HasMaxLength(1000)
            .HasConversion(
                v => string.Join(";", v),
                v => v.Split(";", StringSplitOptions.RemoveEmptyEntries));
        
        // Value Comparers needed for array properties when using value conversion
        var stringArrayComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<IReadOnlyList<string>>(
            (c1, c2) => c1!.SequenceEqual(c2!),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToArray());

        builder.Property(x => x.ImageUrls).Metadata.SetValueComparer(stringArrayComparer);
        builder.Property(x => x.Tags).Metadata.SetValueComparer(stringArrayComparer);
    }
}

public sealed class ContentItemConfiguration : IEntityTypeConfiguration<ContentItem>
{
    public void Configure(EntityTypeBuilder<ContentItem> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasConversion(id => id.Value, value => new ContentId(value));

        builder.Property(x => x.AuthorId)
            .HasConversion(id => id.Value, value => new AuthorId(value));
        
        builder.Property(x => x.Type)
            .HasConversion(new EnumToStringConverter<ContentType>());

        builder.Property(x => x.Tags).HasMaxLength(1000)
            .HasConversion(
                v => string.Join(";", v),
                v => v.Split(";", StringSplitOptions.RemoveEmptyEntries));

        var stringArrayComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<string[]>(
            (c1, c2) => c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToArray());

        builder.Property(x => x.Tags).Metadata.SetValueComparer(stringArrayComparer);
    }
}

public sealed class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasConversion(id => id.Value, value => new UserId(value));
        
        builder.Property(x => x.Balance).HasPrecision(18, 2);
    }
}

public sealed class UserFavoriteModelConfiguration : IEntityTypeConfiguration<UserFavoriteModel>
{
    public void Configure(EntityTypeBuilder<UserFavoriteModel> builder)
    {
        builder.HasKey(x => new { x.UserId, x.ModelId });
    }
}

public sealed class UserFollowAuthorConfiguration : IEntityTypeConfiguration<UserFollowAuthor>
{
    public void Configure(EntityTypeBuilder<UserFollowAuthor> builder)
    {
        builder.HasKey(x => new { x.UserId, x.AuthorId });
    }
}

public sealed class UserMyContentConfiguration : IEntityTypeConfiguration<UserMyContent>
{
    public void Configure(EntityTypeBuilder<UserMyContent> builder)
    {
        builder.HasKey(x => new { x.UserId, x.ContentId });
    }
}

public sealed class UserMyModelConfiguration : IEntityTypeConfiguration<UserMyModel>
{
    public void Configure(EntityTypeBuilder<UserMyModel> builder)
    {
        builder.HasKey(x => new { x.UserId, x.ModelId });
    }
}

public sealed class UserPurchaseConfiguration : IEntityTypeConfiguration<UserPurchase>
{
    public void Configure(EntityTypeBuilder<UserPurchase> builder)
    {
        builder.HasKey(x => new { x.UserId, x.ModelId });
    }
}

public sealed class UserViewHistoryConfiguration : IEntityTypeConfiguration<UserViewHistory>
{
    public void Configure(EntityTypeBuilder<UserViewHistory> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
    }
}

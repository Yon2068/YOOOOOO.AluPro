using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Application.Contents;
using YOOOOOO.AluPro.Application.Users;
using YOOOOOO.AluPro.Domain.Contents;
using YOOOOOO.AluPro.Domain.Models;
using YOOOOOO.AluPro.Domain.Users;

namespace YOOOOOO.AluPro.Infrastructure.Persistence.Repositories;

public sealed class EfUserActionService : IUserActionService
{
    private readonly AluProDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public EfUserActionService(AluProDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        // Fallback for unauthenticated access (or return specific guest ID)
        return Guid.Parse("00000000-0000-0000-0000-000000000001");
    }

    public async Task<ToggleResultDto?> ToggleModelFavorite(Guid modelId, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var modelExists = await _db.Models.AnyAsync(x => x.Id == new ModelId(modelId), ct);
        if (!modelExists) return null;

        var existing = await _db.UserFavorites.FirstOrDefaultAsync(x => x.UserId == userId && x.ModelId == modelId, ct);
        if (existing is not null)
        {
            _db.UserFavorites.Remove(existing);
            await _db.SaveChangesAsync(ct);
            return new ToggleResultDto(modelId.ToString(), false);
        }
        else
        {
            _db.UserFavorites.Add(new UserFavoriteModel { UserId = userId, ModelId = modelId, CreatedAt = DateTime.UtcNow });
            await _db.SaveChangesAsync(ct);
            return new ToggleResultDto(modelId.ToString(), true);
        }
    }

    public async Task<PurchaseResultDto> PurchaseModel(Guid modelId, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var model = await _db.Models.FirstOrDefaultAsync(x => x.Id == new ModelId(modelId), ct);
        if (model is null) return new PurchaseResultDto(false, "Model not found", 0);

        var existing = await _db.UserPurchases.AnyAsync(x => x.UserId == userId && x.ModelId == modelId, ct);
        if (existing) return new PurchaseResultDto(true, "Already purchased", 0);

        var user = await _db.Users.FirstAsync(u => u.Id == new UserId(userId), ct);

        if (model.IsFree || model.Price == 0)
        {
            _db.UserPurchases.Add(new UserPurchase { UserId = userId, ModelId = modelId, Amount = 0, PurchasedAt = DateTime.UtcNow });
            // Add download count
            await _db.Models.Where(m => m.Id == model.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(m => m.Downloads, m => m.Downloads + 1), ct);
                
            await _db.SaveChangesAsync(ct);
            return new PurchaseResultDto(true, "Purchased (Free)", user.Balance);
        }

        if (user.Balance < model.Price)
        {
            return new PurchaseResultDto(false, "Insufficient balance", user.Balance);
        }

        // Deduct balance
        await _db.Users.Where(u => u.Id == user.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.Balance, u => u.Balance - model.Price), ct);
            
        _db.UserPurchases.Add(new UserPurchase { UserId = userId, ModelId = modelId, Amount = model.Price, PurchasedAt = DateTime.UtcNow });
        
        // Add download count
        await _db.Models.Where(m => m.Id == model.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.Downloads, m => m.Downloads + 1), ct);

        await _db.SaveChangesAsync(ct);
        
        return new PurchaseResultDto(true, "Purchased", user.Balance - model.Price);
    }

    public async Task<DownloadResultDto?> DownloadModel(Guid modelId, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var model = await _db.Models.FirstOrDefaultAsync(x => x.Id == new ModelId(modelId), ct);
        if (model is null) return null;

        // Check if purchased
        var isPurchased = await _db.UserPurchases.AnyAsync(x => x.UserId == userId && x.ModelId == modelId, ct);
        if (!isPurchased)
        {
            // Not purchased
            return null;
        }

        // In a real app, record download log if needed (UserDownloads is now UserPurchases, so maybe we need UserDownloadLogs?)
        // For now, just return link.
        var downloadUrl = $"https://example.invalid/download/{Uri.EscapeDataString(model.Id.Value.ToString())}";
        return new DownloadResultDto(model.Id.Value.ToString(), downloadUrl);
    }

    public async Task<bool> IsPurchased(Guid modelId, CancellationToken ct)
    {
        if (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated != true)
        {
            return false;
        }
        
        var userId = GetCurrentUserId();
        return await _db.UserPurchases.AnyAsync(x => x.UserId == userId && x.ModelId == modelId, ct);
    }

    public async Task<bool> IsCollected(Guid modelId, CancellationToken ct)
    {
        if (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated != true)
        {
            return false;
        }
        
        var userId = GetCurrentUserId();
        return await _db.UserFavorites.AnyAsync(x => x.UserId == userId && x.ModelId == modelId, ct);
    }

    public async Task<ToggleResultDto?> ToggleAuthorFollow(Guid authorId, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var authorExists = await _db.Authors.AnyAsync(x => x.Id == new Domain.Authors.AuthorId(authorId), ct);
        if (!authorExists) return null;

        var existing = await _db.UserFollows.FirstOrDefaultAsync(x => x.UserId == userId && x.AuthorId == authorId, ct);
        if (existing is not null)
        {
            _db.UserFollows.Remove(existing);
            await _db.SaveChangesAsync(ct);
            return new ToggleResultDto(authorId.ToString(), false);
        }
        else
        {
            _db.UserFollows.Add(new UserFollowAuthor { UserId = userId, AuthorId = authorId, CreatedAt = DateTime.UtcNow });
            await _db.SaveChangesAsync(ct);
            return new ToggleResultDto(authorId.ToString(), true);
        }
    }

    public async Task<ContentDetailDto> PublishContent(PublishContentCommand command, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var type = string.Equals(command.Type, "video", StringComparison.OrdinalIgnoreCase) ? ContentType.Video : ContentType.Article;
        var contentId = Guid.NewGuid();
        
        // Pick first author for demo
        var author = await _db.Authors.FirstAsync(ct);
        var authorId = author.Id;

        var cover = string.IsNullOrWhiteSpace(command.Cover)
            ? $"https://picsum.photos/800/450?random={Uri.EscapeDataString(contentId.ToString())}"
            : command.Cover!;

        var body = string.IsNullOrWhiteSpace(command.Body) ? (command.Summary ?? "") : command.Body!;
        var summary = string.IsNullOrWhiteSpace(command.Summary) ? null : command.Summary;
        var duration = type == ContentType.Video ? "12:34" : null;
        var tags = type == ContentType.Video
            ? new[] { "视频", "教程" }
            : new[] { "文章", "灵感" };

        var item = new ContentItem(
            new ContentId(contentId),
            type,
            command.Title.Trim(),
            cover,
            authorId,
            0,
            0,
            0,
            summary,
            duration,
            DateTime.UtcNow.ToString("yyyy-MM-dd"),
            tags,
            command.VideoUrl,
            body);

        _db.Content.Add(item);
        _db.UserMyContents.Add(new UserMyContent { UserId = userId, ContentId = contentId, CreatedAt = DateTime.UtcNow });
        
        await _db.SaveChangesAsync(ct);

        return new ContentDetailDto(
            item.Id.Value.ToString(),
            type == ContentType.Video ? "video" : "article",
            item.Title,
            item.CoverUrl,
            author.Id.Value.ToString(),
            author.Name,
            author.AvatarUrl,
            new ContentStatsDto(item.Likes, item.Views, item.Comments),
            item.PublishDate,
            item.Tags,
            item.Body,
            item.VideoUrl,
            item.Duration);
    }

    public async Task RecordView(Guid targetId, string targetType, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        
        // Check if exists to prevent duplication
        var existing = await _db.UserViews.FirstOrDefaultAsync(x => x.UserId == userId && x.TargetId == targetId, ct);
        if (existing != null)
        {
            existing.ViewedAt = DateTime.UtcNow;
            // No need to Add, tracking handles update
        }
        else
        {
            _db.UserViews.Add(new UserViewHistory
            {
                UserId = userId,
                TargetId = targetId,
                TargetType = targetType,
                ViewedAt = DateTime.UtcNow
            });
        }

        // Increment view count
        if (targetType == "model")
        {
            await _db.Models.Where(m => m.Id == new ModelId(targetId))
                .ExecuteUpdateAsync(s => s.SetProperty(m => m.Views, m => m.Views + 1), ct);
        }
        else
        {
            await _db.Content.Where(c => c.Id == new ContentId(targetId))
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.Views, c => c.Views + 1), ct);
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task ClearHistory(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _db.UserViews
            .Where(x => x.UserId == userId)
            .ExecuteDeleteAsync(ct);
    }
}

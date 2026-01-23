using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Application.Users;
using YOOOOOO.AluPro.Domain.Contents;
using YOOOOOO.AluPro.Domain.Models;
using YOOOOOO.AluPro.Domain.Users;

namespace YOOOOOO.AluPro.Infrastructure.Persistence.Repositories;

public sealed class EfUserQueries : IUserQueries
{
    private readonly AluProDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public EfUserQueries(AluProDbContext db, IHttpContextAccessor httpContextAccessor)
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
        // Fallback or guest user ID
        return Guid.Parse("00000000-0000-0000-0000-000000000001");
    }

    public async Task<UserDto> GetMe(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == new UserId(userId), ct);
        if (user is null)
        {
            // Seed if missing (or return error/guest)
            // For demo, if authenticated user not found in DB (unlikely if token valid), return a guest/error
            // But if userId is the hardcoded one, we might need to seed it.
            if (userId == Guid.Parse("00000000-0000-0000-0000-000000000001"))
            {
                 // Check if we need to seed
            }
            // For now, assume if not found, we return a default object or throw
            // Let's create a temporary user in memory for response if not found
            return new UserDto(userId.ToString(), "Guest", "", 0, 0);
        }
        return new UserDto(user.Id.Value.ToString(), user.Nickname, user.AvatarUrl, user.VipLevel, user.Balance);
    }

    public async Task<UserDto?> GetUserById(Guid id, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == new UserId(id), ct);
        if (user is null) return null;
        return new UserDto(user.Id.Value.ToString(), user.Nickname, user.AvatarUrl, user.VipLevel, user.Balance);
    }

    public async Task<IReadOnlyList<FavoriteItemDto>> GetFavorites(string kind, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var typeText = string.Equals(kind, "content", StringComparison.OrdinalIgnoreCase) ? "文章" : "模型";
        
        if (typeText == "模型")
        {
            // 1. Get raw favorite records
            var favorites = await _db.UserFavorites
                .Where(fav => fav.UserId == userId)
                .OrderByDescending(fav => fav.CreatedAt)
                .ToListAsync(ct);

            if (!favorites.Any()) return Array.Empty<FavoriteItemDto>();

            // 2. Fetch Models
            var modelIds = favorites.Select(f => new ModelId(f.ModelId)).Distinct().ToList();
            var models = await _db.Models.Where(m => modelIds.Contains(m.Id)).ToDictionaryAsync(m => m.Id.Value, ct);

            // 3. Fetch Authors
            var authorIds = models.Values.Select(m => m.AuthorId).Distinct().ToList();
            var authors = await _db.Authors.Where(a => authorIds.Contains(a.Id)).ToDictionaryAsync(a => a.Id, ct);

            // 4. Map
            var list = new List<FavoriteItemDto>();
            foreach (var fav in favorites)
            {
                if (models.TryGetValue(fav.ModelId, out var m))
                {
                    var authorName = authors.TryGetValue(m.AuthorId, out var a) ? a.Name : "Unknown";
                    list.Add(new FavoriteItemDto(
                        $"fav-model-{m.Id.Value}",
                        m.Title,
                        m.CoverUrl,
                        authorName,
                        "默认收藏夹",
                        fav.CreatedAt.ToString("yyyy-MM-dd"),
                        "模型"
                    ));
                }
            }
            return list;
        }
        else
        {
             // Mock for content favorites as we didn't implement UserFavoriteContent table yet
             return Array.Empty<FavoriteItemDto>();
        }
    }

    public async Task<IReadOnlyList<HistoryGroupDto>> GetHistory(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        
        // 1. Get deduplicated history (Group by Target in DB)
        var views = await _db.UserViews
            .Where(x => x.UserId == userId)
            .GroupBy(x => new { x.TargetId, x.TargetType })
            .Select(g => new 
            { 
                TargetId = g.Key.TargetId, 
                TargetType = g.Key.TargetType, 
                ViewedAt = g.Max(x => x.ViewedAt) 
            })
            .OrderByDescending(x => x.ViewedAt)
            .Take(20)
            .ToListAsync(ct);

        if (!views.Any()) return Array.Empty<HistoryGroupDto>();

        // 2. Collect IDs
        var modelIds = views.Where(v => v.TargetType == "model").Select(v => new ModelId(v.TargetId)).Distinct().ToList();
        var contentIds = views.Where(v => v.TargetType != "model").Select(v => new ContentId(v.TargetId)).Distinct().ToList();

        // 3. Fetch details
        var models = await _db.Models
            .Where(m => modelIds.Contains(m.Id))
            .ToListAsync(ct);
            
        // Need authors for models
        var authorIds = models.Select(m => m.AuthorId).Distinct().ToList();
        var authors = await _db.Authors.Where(a => authorIds.Contains(a.Id)).ToDictionaryAsync(a => a.Id, ct);
        
        var contents = await _db.Content
            .Where(c => contentIds.Contains(c.Id))
            .ToListAsync(ct);

        // 4. Map
        var dtos = new List<HistoryItemDto>();
        foreach (var v in views)
        {
            // Convert to Beijing Time (+8)
            var viewedAtLocal = v.ViewedAt.AddHours(8);
            
            if (v.TargetType == "model")
            {
                var m = models.FirstOrDefault(x => x.Id.Value == v.TargetId);
                if (m != null)
                {
                    var authorName = authors.TryGetValue(m.AuthorId, out var a) ? a.Name : "";
                    dtos.Add(new HistoryItemDto(v.TargetId.ToString(), m.Title, m.CoverUrl, authorName, viewedAtLocal.ToString("HH:mm"), "model"));
                }
            }
            else
            {
                var c = contents.FirstOrDefault(x => x.Id.Value == v.TargetId);
                if (c != null)
                {
                    dtos.Add(new HistoryItemDto(v.TargetId.ToString(), c.Title, c.CoverUrl, c.Type.ToString(), viewedAtLocal.ToString("HH:mm"), c.Type == ContentType.Video ? "video" : "article"));
                }
            }
        }

        // Grouping (Simplified for demo: Today vs Earlier)
        var groups = dtos.GroupBy(x => "最近浏览") // Just one group for now to save time on date logic
            .Select(g => new HistoryGroupDto(g.Key, g.ToArray()))
            .ToArray();
            
        return groups;
    }

    public async Task<IReadOnlyList<PurchaseItemDto>> GetPurchases(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        
        // 1. Get raw records
        var records = await _db.UserPurchases
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.PurchasedAt)
            .ToListAsync(ct);
            
        if (!records.Any()) return Array.Empty<PurchaseItemDto>();

        // 2. Fetch Models
        var modelIds = records.Select(r => new ModelId(r.ModelId)).Distinct().ToList();
        var models = await _db.Models.Where(m => modelIds.Contains(m.Id)).ToDictionaryAsync(m => m.Id.Value, ct);

        // 3. Fetch Authors
        var authorIds = models.Values.Select(m => m.AuthorId).Distinct().ToList();
        var authors = await _db.Authors.Where(a => authorIds.Contains(a.Id)).ToDictionaryAsync(a => a.Id, ct);

        // 4. Map
        var list = new List<PurchaseItemDto>();
        foreach (var r in records)
        {
            if (models.TryGetValue(r.ModelId, out var m))
            {
                var authorName = authors.TryGetValue(m.AuthorId, out var a) ? a.Name : "Unknown";
                list.Add(new PurchaseItemDto(
                    m.Id.Value.ToString(),
                    m.Title,
                    m.CoverUrl,
                    authorName,
                    m.Size,
                    r.PurchasedAt.ToString("yyyy-MM-dd HH:mm"),
                    "FBX"));
            }
        }
        return list;
    }

    public async Task<IReadOnlyList<MyModelItemDto>> GetMyModels(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        
        // 1. Get raw records
        var records = await _db.UserMyModels
            .Where(my => my.UserId == userId)
            .OrderByDescending(my => my.CreatedAt)
            .ToListAsync(ct);

        if (!records.Any()) return Array.Empty<MyModelItemDto>();

        // 2. Fetch Models
        var modelIds = records.Select(r => new ModelId(r.ModelId)).Distinct().ToList();
        var models = await _db.Models.Where(m => modelIds.Contains(m.Id)).ToDictionaryAsync(m => m.Id.Value, ct);

        // 3. Map
        var list = new List<MyModelItemDto>();
        foreach (var r in records)
        {
             if (models.TryGetValue(r.ModelId, out var m))
             {
                 list.Add(new MyModelItemDto(
                    m.Id.Value.ToString(),
                    m.Title,
                    m.CoverUrl,
                    m.UploadDate,
                    m.Views,
                    m.Likes,
                    m.IsHot ? "已上架" : "审核中"
                 ));
             }
        }
        return list;
    }

    public async Task<IReadOnlyList<MyContentItemDto>> GetMyContents(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var query = from my in _db.UserMyContents
                    where my.UserId == userId
                    join c in _db.Content on my.ContentId equals c.Id.Value
                    select c;

        var items = await query.ToListAsync(ct);

        return items.Select(content => new MyContentItemDto(
            content.Id.Value.ToString(),
            content.Type == ContentType.Video ? "video" : "article",
            content.Title,
            content.CoverUrl,
            content.PublishDate,
            content.Views,
            content.Likes
        )).ToArray();
    }
}

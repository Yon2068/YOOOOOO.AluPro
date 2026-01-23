using Microsoft.EntityFrameworkCore;
using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Domain.Authors;
using YOOOOOO.AluPro.Domain.Contents;
using YOOOOOO.AluPro.Domain.Models;
using YOOOOOO.AluPro.Domain.Users;
using YOOOOOO.AluPro.Infrastructure.Persistence;

namespace YOOOOOO.AluPro.Infrastructure;

public sealed class DbInitializer
{
    private readonly AluProDbContext _db;

    public DbInitializer(AluProDbContext db)
    {
        _db = db;
    }

    public async Task SeedAsync()
    {
        // Force reset content if it exists but has no tags (checking one item is enough for heuristic)
        // Note: EF Core might evaluate this client-side if provider doesn't support array length translation
        var content = await _db.Content.FirstOrDefaultAsync();
        var videoContent = await _db.Content.FirstOrDefaultAsync(c => c.Type == ContentType.Video);
        var needsUpdate = content != null && (content.Tags == null || content.Tags.Length == 0 || string.IsNullOrEmpty(content.Title));
        
        if (videoContent != null && string.IsNullOrEmpty(videoContent.VideoUrl))
        {
            needsUpdate = true;
        }

        var user = await _db.Users.FirstOrDefaultAsync();
        if (user != null && string.IsNullOrEmpty(user.PasswordHash))
        {
            needsUpdate = true;
        }

        // Ensure we have enough mock users and history data
        // FORCE UPDATE for price change (Removed)
        // needsUpdate = true;
        
        if (await _db.Users.CountAsync() < 4 || !await _db.UserViews.AnyAsync())
        {
            needsUpdate = true;
        }
        
        if (await _db.Authors.AnyAsync() && !needsUpdate)
        {
            return;
        }

        if (needsUpdate)
        {
            // Clear existing data to re-seed
            _db.UserFavorites.RemoveRange(_db.UserFavorites);
            _db.UserFollows.RemoveRange(_db.UserFollows);
            _db.UserMyContents.RemoveRange(_db.UserMyContents);
            _db.UserMyModels.RemoveRange(_db.UserMyModels);
            _db.UserPurchases.RemoveRange(_db.UserPurchases);
            _db.UserViews.RemoveRange(_db.UserViews);

            _db.Content.RemoveRange(_db.Content);
            _db.Models.RemoveRange(_db.Models);
            _db.Authors.RemoveRange(_db.Authors);
            _db.Users.RemoveRange(_db.Users);
            await _db.SaveChangesAsync();
        }

        var author1 = new Author(
            new AuthorId(Guid.Parse("d7e8f9a0-b1c2-4d3e-8f9a-0b1c2d3e4f5a")),
            "Alex Design",
            "https://i.pravatar.cc/150?u=author-1",
            "https://picsum.photos/1200/400?random=author-bg",
            "专注 3D 建模与数字艺术设计 10 年。Blender / C4D / Unreal Engine 专家。",
            "Shanghai, China",
            "alex.design",
            "2022-05");

        var author2 = new Author(
            new AuthorId(Guid.Parse("e8f9a0b1-c2d3-4e4f-9a0b-1c2d3e4f5a6b")),
            "Studio B",
            "https://i.pravatar.cc/150?u=author-2",
            "https://picsum.photos/1200/400?random=author-bg-2",
            "专注参数化设计与工业产品可视化。",
            "Shenzhen, China",
            "studio-b.example",
            "2023-01");

        _db.Authors.AddRange(author1, author2);

        var model1 = new ModelAsset(
            new ModelId(Guid.Parse("f9a0b1c2-d3e4-4f5a-0b1c-2d3e4f5a6b7c")),
            "赛博朋克风格建筑模型 High-End",
            "高质量赛博朋克风格建筑模型，适用于游戏场景与影视渲染。",
            "https://picsum.photos/800/600?random=1",
            new[]
            {
                "https://picsum.photos/800/600?random=1",
                "https://picsum.photos/800/600?random=2",
                "https://picsum.photos/800/600?random=3",
                "https://picsum.photos/800/600?random=4"
            },
            author1.Id,
            new[]
            {
                new ModelSpec("格式", "OBJ, FBX, BLEND"),
                new ModelSpec("面数", "125,000"),
                new ModelSpec("贴图", "4K PBR"),
                new ModelSpec("大小", "256 MB")
            },
            new[] { "建筑", "赛博朋克", "科幻", "游戏资产" },
            "2024-03-21",
            "all",
            true,
            true, // IsFree = true
            25m,  // Price = 25
            3420,
            12000,
            560,
            "256 MB");

        var model2 = new ModelAsset(
            new ModelId(Guid.Parse("a0b1c2d3-e4f5-4a6b-1c2d-3e4f5a6b7c8d")),
            "铝型材办公桌 2020 系列",
            "轻量化铝型材办公桌模型，适合快速方案搭建。",
            "https://picsum.photos/800/600?random=5",
            new[]
            {
                "https://picsum.photos/800/600?random=5",
                "https://picsum.photos/800/600?random=6"
            },
            author2.Id,
            new[]
            {
                new ModelSpec("格式", "FBX, OBJ"),
                new ModelSpec("面数", "32,000"),
                new ModelSpec("贴图", "2K"),
                new ModelSpec("大小", "128 MB")
            },
            new[] { "铝型材", "办公", "家具" },
            "2024-03-20",
            "office",
            false,
            true,
            0m,
            1280,
            5600,
            210,
            "128 MB");

        _db.Models.AddRange(model1, model2);

        var content1 = new ContentItem(
            new ContentId(Guid.Parse("b1c2d3e4-f5a6-4b7c-2d3e-4f5a6b7c8d9e")),
            ContentType.Article,
            "关于 React 性能优化的深度解析：从原理到实践",
            "https://picsum.photos/800/400?random=article-1",
            author1.Id,
            1200,
            12000,
            34,
            "从渲染机制出发，梳理 memo/useMemo/useCallback 等优化策略。",
            null,
            "2024-03-21",
            new[] { "React", "Frontend", "Performance", "Hooks" },
            null,
            "React 作为目前最流行的前端框架之一，其性能优化一直是被广泛讨论的话题。");

        var content2 = new ContentItem(
            new ContentId(Guid.Parse("c2d3e4f5-a6b7-4c8d-3e4f-5a6b7c8d9e0f")),
            ContentType.Video,
            "铝型材 入门大师课",
            "https://picsum.photos/800/450?random=video-1",
            author2.Id,
            560,
            23000,
            120,
            "本课程适合零基础学员，通过 10 节课带你掌握铝型材应用。",
            "12:34",
            "2024-03-20",
            new[] { "Aluminum", "Tutorial", "Beginner", "DIY" },
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "从零开始学习铝型材建模、落地技巧，掌握核心工作流。");

        _db.Content.AddRange(content1, content2);

        // Password is "123456" (stored as plain text for demo, use BCrypt in production)
        var demoUser = new UserProfile(new UserId(Guid.Parse("00000000-0000-0000-0000-000000000001")), "测试用户", "https://i.pravatar.cc/150?u=1", 1, 1280m, "123456");
        var user2 = new UserProfile(new UserId(Guid.Parse("00000000-0000-0000-0000-000000000002")), "JohnDoe", "https://i.pravatar.cc/150?u=2", 2, 500m, "123456");
        var user3 = new UserProfile(new UserId(Guid.Parse("00000000-0000-0000-0000-000000000003")), "AliceWonder", "https://i.pravatar.cc/150?u=3", 0, 0m, "123456");
        var user4 = new UserProfile(new UserId(Guid.Parse("00000000-0000-0000-0000-000000000004")), "BobBuilder", "https://i.pravatar.cc/150?u=4", 5, 99999m, "123456");
        
        _db.Users.AddRange(demoUser, user2, user3, user4);

        // Add initial favorites/follows
        _db.UserFavorites.Add(new UserFavoriteModel { UserId = demoUser.Id.Value, ModelId = model1.Id.Value, CreatedAt = DateTime.UtcNow });
        _db.UserFollows.Add(new UserFollowAuthor { UserId = demoUser.Id.Value, AuthorId = author1.Id.Value, CreatedAt = DateTime.UtcNow });

        // Add purchases (model1 is paid 50)
        // _db.UserPurchases.Add(new UserPurchase { UserId = demoUser.Id.Value, ModelId = model1.Id.Value, Amount = 50m, PurchasedAt = DateTime.UtcNow.AddHours(-2) });

        // Add history
        _db.UserViews.Add(new UserViewHistory { UserId = demoUser.Id.Value, TargetId = content1.Id.Value, TargetType = "article", ViewedAt = DateTime.UtcNow.AddMinutes(-30) });
        _db.UserViews.Add(new UserViewHistory { UserId = demoUser.Id.Value, TargetId = model1.Id.Value, TargetType = "model", ViewedAt = DateTime.UtcNow.AddMinutes(-5) });

        // Add my models
        // _db.UserMyModels.Add(new UserMyModel { UserId = demoUser.Id.Value, ModelId = model2.Id.Value, CreatedAt = DateTime.UtcNow.AddDays(-1) });

        await _db.SaveChangesAsync();
    }
}

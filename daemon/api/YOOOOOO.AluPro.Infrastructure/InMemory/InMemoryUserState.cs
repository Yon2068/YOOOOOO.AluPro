using System.Collections.Concurrent;

namespace YOOOOOO.AluPro.Infrastructure.InMemory;

public sealed class InMemoryUserState
{
    private readonly ConcurrentDictionary<Guid, byte> _favoriteModelIds = new();
    private readonly ConcurrentDictionary<Guid, byte> _followedAuthorIds = new();
    private readonly ConcurrentDictionary<Guid, byte> _myContentIds = new();

    public InMemoryUserState()
    {
        _favoriteModelIds.TryAdd(Guid.Parse("f9a0b1c2-d3e4-4f5a-0b1c-2d3e4f5a6b7c"), 0); // model-1
        _followedAuthorIds.TryAdd(Guid.Parse("d7e8f9a0-b1c2-4d3e-8f9a-0b1c2d3e4f5a"), 0); // author-1
    }

    public bool ToggleFavoriteModel(Guid modelId)
    {
        if (_favoriteModelIds.TryRemove(modelId, out _))
        {
            return false;
        }

        _favoriteModelIds[modelId] = 0;
        return true;
    }

    public bool IsFavoriteModel(Guid modelId) => _favoriteModelIds.ContainsKey(modelId);

    public IReadOnlyList<Guid> GetFavoriteModelIds() => _favoriteModelIds.Keys.ToArray();

    public bool ToggleFollowAuthor(Guid authorId)
    {
        if (_followedAuthorIds.TryRemove(authorId, out _))
        {
            return false;
        }

        _followedAuthorIds[authorId] = 0;
        return true;
    }

    public bool IsFollowedAuthor(Guid authorId) => _followedAuthorIds.ContainsKey(authorId);

    public void AddMyContent(Guid contentId) => _myContentIds[contentId] = 0;

    public IReadOnlyList<Guid> GetMyContentIds() => _myContentIds.Keys.ToArray();
}


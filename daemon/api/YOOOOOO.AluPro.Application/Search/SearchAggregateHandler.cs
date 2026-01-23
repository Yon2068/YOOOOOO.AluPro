using YOOOOOO.AluPro.Application.Contents;
using YOOOOOO.AluPro.Application.Models;

namespace YOOOOOO.AluPro.Application.Search;

public sealed class SearchAggregateHandler
{
    private readonly GetModelsHandler _modelsHandler;
    private readonly GetContentHandler _contentHandler;

    public SearchAggregateHandler(GetModelsHandler modelsHandler, GetContentHandler contentHandler)
    {
        _modelsHandler = modelsHandler;
        _contentHandler = contentHandler;
    }

    public async Task<SearchResultDto> Handle(string query, CancellationToken ct)
    {
        var models = await _modelsHandler.Handle(new GetModelsQuery(null, query), ct);
        var content = await _contentHandler.Handle(new GetContentQuery(null, query), ct);

        return new SearchResultDto(models, content);
    }
}

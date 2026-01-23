using YOOOOOO.AluPro.Application.Contents;
using YOOOOOO.AluPro.Application.Models;

namespace YOOOOOO.AluPro.Application.Search;

public sealed record SearchResultDto(
    IReadOnlyList<ModelCardDto> Models,
    IReadOnlyList<ContentCardDto> Contents);

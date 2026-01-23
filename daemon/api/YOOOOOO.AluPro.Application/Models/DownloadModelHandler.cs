using YOOOOOO.AluPro.Application.Abstractions;
using YOOOOOO.AluPro.Application.Users;

namespace YOOOOOO.AluPro.Application.Models;

public sealed record DownloadModelCommand(Guid Id);

public sealed class DownloadModelHandler
{
    private readonly IUserActionService _userActionService;
    public DownloadModelHandler(IUserActionService userActionService) => _userActionService = userActionService;
    public Task<DownloadResultDto?> Handle(DownloadModelCommand command, CancellationToken ct) => _userActionService.DownloadModel(command.Id, ct);
}


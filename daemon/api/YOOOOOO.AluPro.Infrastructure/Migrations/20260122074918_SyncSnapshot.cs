using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YOOOOOO.AluPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserDownloads");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserDownloads",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DownloadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModelId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDownloads", x => x.Id);
                });
        }
    }
}

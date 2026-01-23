using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YOOOOOO.AluPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FinalSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Views",
                table: "Models",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "UserDownloads",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModelId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DownloadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDownloads", x => new { x.UserId, x.ModelId });
                });

            migrationBuilder.CreateTable(
                name: "UserMyModels",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModelId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMyModels", x => new { x.UserId, x.ModelId });
                });

            migrationBuilder.CreateTable(
                name: "UserViews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ViewedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserViews", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserDownloads");

            migrationBuilder.DropTable(
                name: "UserMyModels");

            migrationBuilder.DropTable(
                name: "UserViews");

            migrationBuilder.DropColumn(
                name: "Views",
                table: "Models");
        }
    }
}

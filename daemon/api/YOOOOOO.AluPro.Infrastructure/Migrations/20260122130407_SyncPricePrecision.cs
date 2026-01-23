using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YOOOOOO.AluPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncPricePrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserDownloads");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Models",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "UserPurchases",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModelId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PurchasedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPurchases", x => new { x.UserId, x.ModelId });
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserPurchases");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Models");

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
        }
    }
}

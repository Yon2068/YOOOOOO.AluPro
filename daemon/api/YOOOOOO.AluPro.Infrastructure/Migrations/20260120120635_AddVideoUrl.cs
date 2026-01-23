using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YOOOOOO.AluPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVideoUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Content",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Content");
        }
    }
}

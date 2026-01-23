using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YOOOOOO.AluPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEntityAccessors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Nickname",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "VipLevel",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Models",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CoverUrl",
                table: "Models",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Models",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Downloads",
                table: "Models",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsFree",
                table: "Models",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHot",
                table: "Models",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Likes",
                table: "Models",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "Models",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Models",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UploadDate",
                table: "Models",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Body",
                table: "Content",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Comments",
                table: "Content",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CoverUrl",
                table: "Content",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Duration",
                table: "Content",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Likes",
                table: "Content",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PublishDate",
                table: "Content",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "Content",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Content",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Views",
                table: "Content",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Authors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Authors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CoverUrl",
                table: "Authors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "JoinDate",
                table: "Authors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Authors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Authors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Website",
                table: "Authors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Nickname",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "VipLevel",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "CoverUrl",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "Downloads",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "IsFree",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "IsHot",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "Likes",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "UploadDate",
                table: "Models");

            migrationBuilder.DropColumn(
                name: "Body",
                table: "Content");

            migrationBuilder.DropColumn(
                name: "Comments",
                table: "Content");

            migrationBuilder.DropColumn(
                name: "CoverUrl",
                table: "Content");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Content");

            migrationBuilder.DropColumn(
                name: "Likes",
                table: "Content");

            migrationBuilder.DropColumn(
                name: "PublishDate",
                table: "Content");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "Content");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Content");

            migrationBuilder.DropColumn(
                name: "Views",
                table: "Content");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "CoverUrl",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "JoinDate",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "Website",
                table: "Authors");
        }
    }
}

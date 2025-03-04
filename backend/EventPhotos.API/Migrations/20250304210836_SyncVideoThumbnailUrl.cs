using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventPhotos.API.Migrations
{
    /// <inheritdoc />
    public partial class SyncVideoThumbnailUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add ThumbnailUrl column to Videos table
            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "Videos",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove ThumbnailUrl column if we need to roll back
            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "Videos");
        }
    }
}

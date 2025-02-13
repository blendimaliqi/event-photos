using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventPhotos.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHeroPhotoToEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HeroPhotoId",
                table: "Events",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_HeroPhotoId",
                table: "Events",
                column: "HeroPhotoId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Photos_HeroPhotoId",
                table: "Events",
                column: "HeroPhotoId",
                principalTable: "Photos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_Photos_HeroPhotoId",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_HeroPhotoId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "HeroPhotoId",
                table: "Events");
        }
    }
}

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
            // No-op migration since the ThumbnailUrl column already exists in the database
            // This migration is just to synchronize the model with the database state
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op down migration since we're not adding anything in Up
        }
    }
}

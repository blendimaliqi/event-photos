using Microsoft.EntityFrameworkCore;
using EventPhotos.API.Models;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Event> Events { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<Video> Videos { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // Important to keep this!

        // Configure the relationship between Event and Photo (for all photos)
        modelBuilder.Entity<Photo>()
            .HasOne(p => p.Event)
            .WithMany(e => e.Photos)
            .HasForeignKey(p => p.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure the relationship between Event and Video
        modelBuilder.Entity<Video>()
            .HasOne(v => v.Event)
            .WithMany()
            .HasForeignKey(v => v.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Event>()                    
            .HasOne(e => e.HeroPhoto)                        
            .WithOne()                                      
            .HasForeignKey<Event>(e => e.HeroPhotoId)       
            .IsRequired(false)                             
            .OnDelete(DeleteBehavior.SetNull);                                          
    }
} 
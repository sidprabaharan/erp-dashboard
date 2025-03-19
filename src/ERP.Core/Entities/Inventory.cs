using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Core.Entities
{
    public class Inventory
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        public int Quantity { get; set; }
        
        public string? Location { get; set; }
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }
}

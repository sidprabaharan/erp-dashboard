using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Core.Entities
{
    public class InventoryTransaction
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        public int Quantity { get; set; }
        
        [Required]
        [StringLength(20)]
        public string TransactionType { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? ReferenceNumber { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        [Required]
        public int CreatedBy { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
        
        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }
    }
}

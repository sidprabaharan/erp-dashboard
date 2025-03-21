using System.ComponentModel.DataAnnotations;

namespace ERP.API.DTOs
{
    public class InventoryDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductSku { get; set; }
        public string? ProductName { get; set; }
        public int Quantity { get; set; }
        public string? Location { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class CreateInventoryDto
    {
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
        
        [StringLength(100)]
        public string? Location { get; set; }
    }

    public class UpdateInventoryDto
    {
        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
        
        [StringLength(100)]
        public string? Location { get; set; }
    }
}

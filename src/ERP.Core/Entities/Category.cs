using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.Core.Entities
{
    public class Category
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}

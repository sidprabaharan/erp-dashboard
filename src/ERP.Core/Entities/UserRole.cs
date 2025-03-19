using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Core.Entities
{
    public class UserRole
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
        
        [ForeignKey("RoleId")]
        public virtual Role? Role { get; set; }
    }
}

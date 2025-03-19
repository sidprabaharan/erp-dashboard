using ERP.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERP.Core.Interfaces
{
    public interface IInventoryRepository : IRepository<Inventory>
    {
        Task<Inventory?> GetByProductIdAsync(int productId);
        Task<IReadOnlyList<Inventory>> GetLowStockInventoryAsync(int threshold = 10);
        Task<IReadOnlyList<Inventory>> GetInventoryWithDetailsAsync();
    }
}

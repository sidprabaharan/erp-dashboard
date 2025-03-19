using ERP.Core.Entities;
using ERP.Core.Interfaces;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERP.Infrastructure.Repositories
{
    public class InventoryRepository : RepositoryBase<Inventory>, IInventoryRepository
    {
        public InventoryRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<Inventory?> GetByProductIdAsync(int productId)
        {
            return await _dbContext.Inventory
                .Include(i => i.Product)
                .FirstOrDefaultAsync(i => i.ProductId == productId);
        }

        public async Task<IReadOnlyList<Inventory>> GetLowStockInventoryAsync(int threshold = 10)
        {
            return await _dbContext.Inventory
                .Include(i => i.Product)
                .Where(i => i.Quantity <= threshold)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<Inventory>> GetInventoryWithDetailsAsync()
        {
            return await _dbContext.Inventory
                .Include(i => i.Product)
                    .ThenInclude(p => p!.Category)
                .ToListAsync();
        }
    }
}

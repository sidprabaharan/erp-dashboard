using ERP.Core.Entities;
using ERP.Core.Interfaces;
using ERP.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERP.Infrastructure.Repositories
{
    public class ProductRepository : RepositoryBase<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<Product?> GetBySkuAsync(string sku)
        {
            return await _dbContext.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.SKU == sku);
        }

        public async Task<IReadOnlyList<Product>> GetProductsWithInventoryAsync()
        {
            return await _dbContext.Products
                .Include(p => p.Category)
                .Include(p => p.Inventories)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            return await _dbContext.Products
                .Include(p => p.Category)
                .Include(p => p.Inventories)
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();
        }

        public async Task<bool> SkuExistsAsync(string sku)
        {
            return await _dbContext.Products.AnyAsync(p => p.SKU == sku);
        }
    }
}

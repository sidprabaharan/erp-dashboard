using ERP.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERP.Core.Interfaces
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<Product?> GetBySkuAsync(string sku);
        Task<IReadOnlyList<Product>> GetProductsWithInventoryAsync();
        Task<IReadOnlyList<Product>> GetProductsByCategoryAsync(int categoryId);
        Task<bool> SkuExistsAsync(string sku);
    }
}

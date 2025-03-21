import api from './apiService';

// Get all inventory
export const getAllInventory = async () => {
  try {
    const response = await api.get('/inventory');
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

// Get low stock inventory
export const getLowStockInventory = async (threshold = 10) => {
  try {
    const response = await api.get(`/inventory/low-stock?threshold=${threshold}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching low stock inventory:', error);
    throw error;
  }
};

// Get inventory by product id
export const getInventoryByProductId = async (productId) => {
  try {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventory for product ${productId}:`, error);
    throw error;
  }
};

// Create inventory
export const createInventory = async (inventoryData) => {
  try {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating inventory:', error);
    throw error;
  }
};

// Update inventory
export const updateInventory = async (id, inventoryData) => {
  try {
    const response = await api.put(`/inventory/${id}`, inventoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating inventory ${id}:`, error);
    throw error;
  }
};

// Delete inventory
export const deleteInventory = async (id) => {
  try {
    await api.delete(`/inventory/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting inventory ${id}:`, error);
    throw error;
  }
};

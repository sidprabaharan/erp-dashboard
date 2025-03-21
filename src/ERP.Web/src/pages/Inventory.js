import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllInventory, createInventory, updateInventory, deleteInventory } from '../services/inventoryService';
import { getAllProducts } from '../services/productService';
import { AuthContext } from '../context/AuthContext';
import InventoryTable from '../components/InventoryTable';

const Inventory = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    location: ''
  });
  const { user, hasRole } = useContext(AuthContext);
  
  // Check permissions
  const canEdit = hasRole('Admin') || hasRole('Manager') || hasRole('Staff');
  const canDelete = hasRole('Admin') || hasRole('Manager');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch inventory data
        const inventoryData = await getAllInventory();
        setInventory(inventoryData);
        
        // Fetch products for dropdown
        const productsData = await getAllProducts();
        setProducts(productsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching inventory data:', err);
        setError('Failed to load inventory data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      productId: '',
      quantity: '',
      location: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (item) => {
    setDialogMode('edit');
    setSelectedItem(item);
    setFormData({
      productId: item.productId,
      quantity: item.quantity,
      location: item.location || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        // Create new inventory
        const newInventory = await createInventory(formData);
        setInventory([...inventory, newInventory]);
      } else {
        // Update existing inventory
        const updatedInventory = await updateInventory(selectedItem.id, formData);
        setInventory(inventory.map(item => 
          item.id === updatedInventory.id ? updatedInventory : item
        ));
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error submitting inventory:', err);
      setError('Failed to save inventory data. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteInventory(id);
        setInventory(inventory.filter(item => item.id !== id));
      } catch (err) {
        console.error('Error deleting inventory:', err);
        setError('Failed to delete inventory. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Inventory Management
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add Inventory
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Current Inventory
        </Typography>
        
        {inventory.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Product</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>SKU</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Quantity</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Last Updated</th>
                  {canEdit && (
                    <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>{item.productName}</td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>{item.productSku}</td>
                    <td style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>{item.quantity}</td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>{item.location || 'N/A'}</td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                      {new Date(item.lastUpdated).toLocaleString()}
                    </td>
                    {canEdit && (
                      <td style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '1px solid #ddd' }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenEditDialog(item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {canDelete && (
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ) : (
          <Alert severity="info">No inventory items found.</Alert>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Inventory' : 'Edit Inventory'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth disabled={dialogMode === 'edit'}>
                  <InputLabel id="product-select-label">Product</InputLabel>
                  <Select
                    labelId="product-select-label"
                    id="product-select"
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    label="Product"
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Warehouse A, Shelf 3"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            color="primary"
            disabled={!formData.productId || !formData.quantity}
          >
            {dialogMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;

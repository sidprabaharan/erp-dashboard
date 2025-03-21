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
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { AuthContext } from '../context/AuthContext';

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    price: '',
    cost: ''
  });
  const { user, hasRole } = useContext(AuthContext);
  
  // Check permissions
  const canEdit = hasRole('Admin') || hasRole('Manager') || hasRole('Staff');
  const canDelete = hasRole('Admin') || hasRole('Manager');

  // Dummy categories (in a real app, these would be fetched from the API)
  const categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Office Supplies' },
    { id: 3, name: 'Furniture' },
    { id: 4, name: 'Raw Materials' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products data
        const productsData = await getAllProducts();
        setProducts(productsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching products data:', err);
        setError('Failed to load products data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      sku: '',
      name: '',
      description: '',
      categoryId: '',
      price: '',
      cost: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (product) => {
    setDialogMode('edit');
    setSelectedProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId || '',
      price: product.price,
      cost: product.cost
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
        // Create new product
        const newProduct = await createProduct(formData);
        setProducts([...products, newProduct]);
      } else {
        // Update existing product
        const updatedProduct = await updateProduct(selectedProduct.id, formData);
        setProducts(products.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        ));
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error submitting product:', err);
      setError('Failed to save product data. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product. Please try again.');
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
          Product Management
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add Product
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {products.length > 0 ? (
          products.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" gutterBottom>
                      {product.name}
                    </Typography>
                    <Chip
                      label={product.categoryName || 'Uncategorized'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    SKU: {product.sku}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {product.description || 'No description available.'}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body1">
                      Price: ${product.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      Cost: ${product.cost.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  {canEdit && (
                    <>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEditDialog(product)}
                      >
                        Edit
                      </Button>
                      {canDelete && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">No products found.</Alert>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Product' : 'Edit Product'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: '$',
                    inputProps: { min: 0, step: 0.01 }
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: '$',
                    inputProps: { min: 0, step: 0.01 }
                  }}
                  required
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
            disabled={!formData.sku || !formData.name || !formData.price || !formData.cost}
          >
            {dialogMode === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;

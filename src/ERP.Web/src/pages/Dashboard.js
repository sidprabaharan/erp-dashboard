import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { getProductsWithInventory } from '../services/productService';
import { getLowStockInventory } from '../services/inventoryService';
import InventoryTable from '../components/InventoryTable';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInventory: 0,
    lowStockCount: 0,
    inventoryValue: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get products with inventory
        const productsData = await getProductsWithInventory();
        setProducts(productsData);
        
        // Get low stock inventory
        const lowStockData = await getLowStockInventory(10);
        setLowStockItems(lowStockData);
        
        // Calculate stats
        const totalProducts = productsData.length;
        const totalInventory = productsData.reduce((sum, product) => sum + product.totalQuantity, 0);
        const lowStockCount = lowStockData.length;
        const inventoryValue = productsData.reduce((sum, product) => sum + (product.totalQuantity * product.cost), 0);
        
        setStats({
          totalProducts,
          totalInventory,
          lowStockCount,
          inventoryValue
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Prepare chart data
  const categoryData = React.useMemo(() => {
    const categories = {};
    
    products.forEach(product => {
      const categoryName = product.categoryName || 'Uncategorized';
      if (!categories[categoryName]) {
        categories[categoryName] = {
          count: 0,
          inventory: 0,
          value: 0
        };
      }
      
      categories[categoryName].count += 1;
      categories[categoryName].inventory += product.totalQuantity;
      categories[categoryName].value += product.totalQuantity * product.cost;
    });
    
    return {
      labels: Object.keys(categories),
      countData: Object.values(categories).map(c => c.count),
      inventoryData: Object.values(categories).map(c => c.inventory),
      valueData: Object.values(categories).map(c => c.value.toFixed(2))
    };
  }, [products]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        ERP Dashboard
      </Typography>
      
      {/* Summary cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <InventoryIcon fontSize="large" color="primary" />
                <Box ml={2}>
                  <Typography variant="body2" color="textSecondary">
                    Total Products
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalProducts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocalShippingIcon fontSize="large" color="primary" />
                <Box ml={2}>
                  <Typography variant="body2" color="textSecondary">
                    Total Inventory
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalInventory}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningIcon fontSize="large" color="error" />
                <Box ml={2}>
                  <Typography variant="body2" color="textSecondary">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h5">
                    {stats.lowStockCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoneyIcon fontSize="large" color="primary" />
                <Box ml={2}>
                  <Typography variant="body2" color="textSecondary">
                    Inventory Value
                  </Typography>
                  <Typography variant="h5">
                    ${stats.inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory by Category
            </Typography>
            <Box height={300}>
              <Bar
                data={{
                  labels: categoryData.labels,
                  datasets: [
                    {
                      label: 'Quantity',
                      data: categoryData.inventoryData,
                      backgroundColor: 'rgba(54, 162, 235, 0.6)',
                      borderColor: 'rgba(54, 162, 235, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Inventory Quantity by Category'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Value by Category
            </Typography>
            <Box height={300}>
              <Doughnut
                data={{
                  labels: categoryData.labels,
                  datasets: [
                    {
                      label: 'Value',
                      data: categoryData.valueData,
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                      ],
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Inventory Value Distribution'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Low stock inventory table */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Low Stock Items
        </Typography>
        {lowStockItems.length > 0 ? (
          <InventoryTable inventory={lowStockItems} />
        ) : (
          <Alert severity="info">No low stock items found.</Alert>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;

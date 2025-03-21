import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';

const InventoryTable = ({ inventory }) => {
  const getStockStatusColor = (quantity) => {
    if (quantity <= 5) return 'error';
    if (quantity <= 10) return 'warning';
    return 'success';
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product SKU</TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Last Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventory.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.productSku}</TableCell>
              <TableCell>{item.productName}</TableCell>
              <TableCell>
                <Chip
                  label={item.quantity}
                  color={getStockStatusColor(item.quantity)}
                  size="small"
                />
              </TableCell>
              <TableCell>{item.location || 'N/A'}</TableCell>
              <TableCell>
                {new Date(item.lastUpdated).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InventoryTable;

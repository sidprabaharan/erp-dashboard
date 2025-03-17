-- Create database
CREATE DATABASE ERPDatabase;
GO

USE ERPDatabase;
GO

-- Create tables
CREATE TABLE [dbo].[Users] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Username] NVARCHAR(50) NOT NULL UNIQUE,
    [Email] NVARCHAR(100) NOT NULL UNIQUE,
    [PasswordHash] NVARCHAR(128) NOT NULL,
    [FirstName] NVARCHAR(50) NULL,
    [LastName] NVARCHAR(50) NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [LastLogin] DATETIME2 NULL
);
GO

CREATE TABLE [dbo].[Roles] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(50) NOT NULL UNIQUE,
    [Description] NVARCHAR(200) NULL
);
GO

CREATE TABLE [dbo].[UserRoles] (
    [UserId] INT NOT NULL,
    [RoleId] INT NOT NULL,
    PRIMARY KEY ([UserId], [RoleId]),
    FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE,
    FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [dbo].[Categories] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(500) NULL
);
GO

CREATE TABLE [dbo].[Products] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [SKU] NVARCHAR(50) NOT NULL UNIQUE,
    [Name] NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [CategoryId] INT NULL,
    [Price] DECIMAL(18,2) NOT NULL,
    [Cost] DECIMAL(18,2) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories] ([Id])
);
GO

-- Create index on Products.SKU for faster lookup
CREATE NONCLUSTERED INDEX [IX_Products_SKU] ON [dbo].[Products] ([SKU]);
GO

CREATE TABLE [dbo].[Inventory] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [ProductId] INT NOT NULL,
    [Quantity] INT NOT NULL,
    [Location] NVARCHAR(100) NULL,
    [LastUpdated] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([Id]) ON DELETE CASCADE
);
GO

-- Create index on Inventory.ProductId for faster joins
CREATE NONCLUSTERED INDEX [IX_Inventory_ProductId] ON [dbo].[Inventory] ([ProductId]);
GO

CREATE TABLE [dbo].[InventoryTransactions] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [ProductId] INT NOT NULL,
    [Quantity] INT NOT NULL,
    [TransactionType] NVARCHAR(20) NOT NULL, -- 'Receiving', 'Shipping', 'Adjustment'
    [ReferenceNumber] NVARCHAR(50) NULL,
    [Notes] NVARCHAR(500) NULL,
    [CreatedBy] INT NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([Id]),
    FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users] ([Id])
);
GO

-- Create index on InventoryTransactions for reporting queries
CREATE NONCLUSTERED INDEX [IX_InventoryTransactions_ProductId] ON [dbo].[InventoryTransactions] ([ProductId]);
CREATE NONCLUSTERED INDEX [IX_InventoryTransactions_CreatedAt] ON [dbo].[InventoryTransactions] ([CreatedAt]);
GO

-- Seed initial data
INSERT INTO [dbo].[Roles] ([Name], [Description]) VALUES 
('Admin', 'System administrator with full access'),
('Manager', 'Department manager with elevated access'),
('Staff', 'Regular staff with basic access'),
('ReadOnly', 'Read-only access to reports');
GO

-- Insert admin user with password 'Admin@123'
INSERT INTO [dbo].[Users] ([Username], [Email], [PasswordHash], [FirstName], [LastName])
VALUES ('admin', 'admin@example.com', 'AQAAAAEAACcQAAAAEHxsqvVWACqT5jztLHbMvvuBQEgySX6vCJwgElYY2T8SbSZ3nUBONjSrFDrjUBEOPw==', 'System', 'Admin');
GO

-- Assign admin role
INSERT INTO [dbo].[UserRoles] ([UserId], [RoleId]) VALUES (1, 1);
GO

-- Insert categories
INSERT INTO [dbo].[Categories] ([Name], [Description]) VALUES
('Electronics', 'Electronic components and devices'),
('Office Supplies', 'General office supplies'),
('Furniture', 'Office furniture and fixtures'),
('Raw Materials', 'Manufacturing raw materials');
GO

-- Insert sample products (50 products across categories)
-- Electronics category
INSERT INTO [dbo].[Products] ([SKU], [Name], [Description], [CategoryId], [Price], [Cost])
VALUES 
('EL-001', 'Desktop Computer', 'Standard office desktop computer', 1, 899.99, 650.00),
('EL-002', 'Laptop', 'Business laptop', 1, 1299.99, 900.00),
('EL-003', 'Monitor', '24-inch LED monitor', 1, 249.99, 180.00),
('EL-004', 'Keyboard', 'Wireless keyboard', 1, 59.99, 35.00),
('EL-005', 'Mouse', 'Wireless mouse', 1, 29.99, 18.00),
('EL-006', 'Printer', 'Laser printer', 1, 349.99, 260.00),
('EL-007', 'Scanner', 'Document scanner', 1, 199.99, 140.00),
('EL-008', 'External Hard Drive', '1TB external hard drive', 1, 89.99, 60.00),
('EL-009', 'USB Drive', '64GB USB flash drive', 1, 19.99, 12.00),
('EL-010', 'Network Switch', '8-port gigabit switch', 1, 79.99, 55.00);
GO

-- Office Supplies category
INSERT INTO [dbo].[Products] ([SKU], [Name], [Description], [CategoryId], [Price], [Cost])
VALUES 
('OS-001', 'Paper Ream', 'A4 paper ream, 500 sheets', 2, 8.99, 5.50),
('OS-002', 'Stapler', 'Standard desk stapler', 2, 12.99, 7.80),
('OS-003', 'Staples', 'Box of 5000 staples', 2, 3.99, 2.20),
('OS-004', 'Pen Set', 'Set of 12 ballpoint pens', 2, 9.99, 6.00),
('OS-005', 'Notebook', 'Spiral-bound notebook', 2, 4.99, 2.80),
('OS-006', 'Sticky Notes', 'Pack of 5 sticky note pads', 2, 7.99, 4.50),
('OS-007', 'Scissors', 'Office scissors', 2, 6.99, 3.90),
('OS-008', 'Tape Dispenser', 'Desktop tape dispenser', 2, 8.99, 5.30),
('OS-009', 'Tape Rolls', 'Pack of 6 tape rolls', 2, 11.99, 7.20),
('OS-010', 'Binder Clips', 'Assorted size binder clips', 2, 5.99, 3.40);
GO

-- Insert initial inventory
-- Add inventory for each product (sample of 20 products)
INSERT INTO [dbo].[Inventory] ([ProductId], [Quantity], [Location])
VALUES 
(1, 25, 'Warehouse A, Shelf 1'),
(2, 15, 'Warehouse A, Shelf 1'),
(3, 30, 'Warehouse A, Shelf 2'),
(4, 50, 'Warehouse A, Shelf 2'),
(5, 50, 'Warehouse A, Shelf 2'),
(6, 10, 'Warehouse A, Shelf 3'),
(7, 12, 'Warehouse A, Shelf 3'),
(8, 20, 'Warehouse A, Shelf 4'),
(9, 45, 'Warehouse A, Shelf 4'),
(10, 8, 'Warehouse A, Shelf 4'),
(11, 100, 'Warehouse B, Shelf 1'),
(12, 35, 'Warehouse B, Shelf 1'),
(13, 80, 'Warehouse B, Shelf 1'),
(14, 60, 'Warehouse B, Shelf 2'),
(15, 45, 'Warehouse B, Shelf 2'),
(16, 50, 'Warehouse B, Shelf 2'),
(17, 25, 'Warehouse B, Shelf 3'),
(18, 30, 'Warehouse B, Shelf 3'),
(19, 40, 'Warehouse B, Shelf 3'),
(20, 55, 'Warehouse B, Shelf 3');
GO

-- Sample inventory transactions
INSERT INTO [dbo].[InventoryTransactions] ([ProductId], [Quantity], [TransactionType], [ReferenceNumber], [Notes], [CreatedBy])
VALUES 
(1, 30, 'Receiving', 'PO-12345', 'Initial stock', 1),
(1, -5, 'Shipping', 'SO-54321', 'Customer order', 1),
(2, 20, 'Receiving', 'PO-12346', 'Initial stock', 1),
(2, -5, 'Shipping', 'SO-54322', 'Customer order', 1),
(3, 35, 'Receiving', 'PO-12347', 'Initial stock', 1),
(3, -5, 'Shipping', 'SO-54323', 'Customer order', 1),
(4, 55, 'Receiving', 'PO-12348', 'Initial stock', 1),
(4, -5, 'Shipping', 'SO-54324', 'Customer order', 1),
(5, 55, 'Receiving', 'PO-12349', 'Initial stock', 1),
(5, -5, 'Shipping', 'SO-54325', 'Customer order', 1);
GO

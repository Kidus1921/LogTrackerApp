# Database Schema Documentation

## Overview

This directory contains the SQL schema definition for the LogTracker application database, designed for Supabase (PostgreSQL).

## Setup Instructions

### 1. Run the Schema in Supabase

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `lqgnonaqzeexmmznabzd`
3. Navigate to **SQL Editor** from the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `schema.sql`
6. Click **Run** or press `Ctrl+Enter` to execute

The schema will create:
- Two tables: `purchases` and `repairs`
- Multiple indexes for performance optimization
- Triggers for automatic timestamp updates
- Constraints for data integrity

### 2. Verify Table Creation

After running the schema:

1. Go to **Table Editor** in the Supabase dashboard
2. You should see two tables:
   - `purchases`
   - `repairs`
3. Click on each table to inspect the columns and constraints

## Database Structure

### Tables

#### `purchases`
Stores all purchase records for items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated unique identifier |
| `item_name` | TEXT | NOT NULL | Name of the purchased item |
| `category` | TEXT | - | Category (e.g., Electronics, Appliances) |
| `price` | NUMERIC(10,2) | CHECK >= 0 | Purchase price in dollars |
| `purchase_date` | TIMESTAMPTZ | - | Date when item was purchased |
| `vendor` | TEXT | - | Store or supplier name |
| `warranty_months` | INTEGER | CHECK >= 0 | Warranty duration in months |
| `receipt_uri` | TEXT | - | URI to receipt image/document |
| `notes` | TEXT | - | Additional notes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

#### `repairs`
Stores all repair records for items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated unique identifier |
| `item_name` | TEXT | NOT NULL | Name of the item being repaired |
| `issue` | TEXT | NOT NULL | Description of the issue |
| `cost` | NUMERIC(10,2) | CHECK >= 0 | Repair cost in dollars |
| `repair_date` | TIMESTAMPTZ | - | Date when repair was performed |
| `provider` | TEXT | - | Service provider name |
| `status` | TEXT | CHECK IN ('pending', 'completed') | Repair status |
| `notes` | TEXT | - | Additional notes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Indexes

The following indexes are created for optimal query performance:

- `idx_purchases_created_at`: Fast retrieval of recent purchases
- `idx_repairs_created_at`: Fast retrieval of recent repairs
- `idx_purchases_item_name`: Search purchases by item name
- `idx_repairs_item_name`: Search repairs by item name
- `idx_repairs_status`: Filter repairs by status
- `idx_purchases_purchase_date`: Date-based purchase queries
- `idx_repairs_repair_date`: Date-based repair queries

### Triggers

- **Auto-update timestamps**: The `updated_at` column is automatically updated whenever a record is modified

## Security Recommendations

### Row Level Security (RLS)

For production use, consider enabling Row Level Security:

```sql
-- Enable RLS on tables
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

-- Example: Allow authenticated users to manage their own data
-- Note: Modify based on your authentication setup

CREATE POLICY "Users can insert their own purchases" ON purchases
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own purchases" ON purchases
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own purchases" ON purchases
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own purchases" ON purchases
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Repeat similar policies for repairs table
```

## Data Migration

If you have existing data in AsyncStorage that needs to be migrated:

1. Export your current data using the `exportCSV()` function
2. Parse the CSV file
3. Use the Supabase dashboard's **Table Editor** to import data, or
4. Create a migration script to insert data via the Supabase client

## Maintenance

### Backup

Supabase automatically backs up your database. You can also:
- Download backups from the Supabase dashboard
- Set up point-in-time recovery (available on paid plans)

### Monitoring

Monitor your database performance in the Supabase dashboard:
- **Database** → **Database** → View connection stats
- **Database** → **Extensions** → Manage extensions
- **Logs** → View query logs and errors

# Inventory Management System - Backend

This is the backend API for the Inventory Management System built with Node.js, Express, and MySQL.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Database Setup

1. **Install MySQL Server** (if not already installed)
   - Download and install MySQL from https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP for easier setup

2. **Create Database**
   - Open MySQL command line or phpMyAdmin
   - Run the SQL commands from `database_schema.sql`:
     ```sql
     CREATE DATABASE IF NOT EXISTS Garage_service;
     USE Garage_service;
     -- Then run the rest of the schema
     ```

3. **Configure Database Connection**
   - Update the connection details in `server.js` if needed:
     ```javascript
     const conn = mysql.createConnection({
         host: 'localhost',
         user: 'root',        // Your MySQL username
         password: '',        // Your MySQL password
         database: 'Garage_service'
     });
     ```

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   # or for development
   node server.js
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### Spare Parts
- `GET /api/spare-parts` - Get all spare parts
- `GET /api/spare-parts/:id` - Get single spare part
- `POST /api/spare-parts` - Create new spare part
- `PUT /api/spare-parts/:id` - Update spare part
- `DELETE /api/spare-parts/:id` - Delete spare part

### Stock Operations
- `GET /api/stock-operations` - Get all stock operations
- `POST /api/stock-operations` - Record stock in/out operation

### Reports
- `GET /api/reports/daily?date=YYYY-MM-DD` - Get daily report
- `GET /api/reports/monthly?month=YYYY-MM` - Get monthly report

## Sample API Usage

### Create Spare Part
```bash
curl -X POST http://localhost:5000/api/spare-parts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engine Oil",
    "description": "High quality synthetic oil",
    "category": "Lubricants",
    "quantity": 50,
    "price": 25.99
  }'
```

### Record Stock Operation
```bash
curl -X POST http://localhost:5000/api/stock-operations \
  -H "Content-Type: application/json" \
  -d '{
    "type": "in",
    "sparePartId": 1,
    "quantity": 10,
    "date": "2026-05-09",
    "notes": "New shipment received"
  }'
```

## Database Schema

The system uses two main tables:
- `spare_parts`: Stores spare part information
- `stock_operations`: Records all stock in/out transactions

Foreign key relationships ensure data integrity.

## Troubleshooting

1. **Database Connection Error**
   - Ensure MySQL server is running
   - Check username/password in `server.js`
   - Verify database name exists

2. **Port Already in Use**
   - Change the port in `server.js` (default: 5000)

3. **CORS Issues**
   - The server is configured with CORS to allow frontend connections
   - Frontend runs on different port (5173 by default)
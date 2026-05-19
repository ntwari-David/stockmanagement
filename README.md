# Inventory Management System

A full-stack inventory management system built with React (frontend) and Node.js/Express/MySQL (backend) for managing spare parts, tracking stock operations, and generating reports.

## Features

- **Spare Parts Management**: Add, edit, delete, and view spare parts inventory
- **Stock Operations**: Record stock in/out transactions with automatic quantity updates
- **Reports**: Generate daily and monthly reports with stock movement summaries
- **Real-time Updates**: Automatic inventory quantity updates when recording stock operations
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

### Frontend
- React 19
- Vite (build tool)
- Tailwind CSS (styling)
- Fetch API (HTTP requests)

### Backend
- Node.js
- Express.js
- MySQL2 (database driver)
- CORS (cross-origin requests)

## Project Structure

```
inventory-management-system/
├── backend_project/
│   ├── server.js              # Main server file with API routes
│   ├── database_schema.sql    # Database schema
│   ├── package.json          # Backend dependencies
│   └── README.md             # Backend setup instructions
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React app component
│   │   ├── components/
│   │   │   ├── SpareParts.jsx    # Spare parts management
│   │   │   ├── StockOperations.jsx # Stock in/out operations
│   │   │   └── Reports.jsx       # Daily/monthly reports
│   │   ├── index.css         # Global styles with Tailwind
│   │   └── main.jsx          # React app entry point
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite configuration
│   └── postcss.config.js     # PostCSS configuration
└── README.md                 # This file
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### 1. Database Setup

1. **Install MySQL Server**
   - Download from https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP for easier setup

2. **Create Database**
   ```sql
   CREATE DATABASE IF NOT EXISTS Garage_service;
   USE Garage_service;
   ```
   Then run the SQL commands from `backend_project/database_schema.sql`

### 2. Backend Setup

```bash
cd backend_project
npm install
npm start
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5177`

## API Endpoints

### Spare Parts
- `GET /api/spare-parts` - Get all spare parts
- `POST /api/spare-parts` - Create spare part
- `PUT /api/spare-parts/:id` - Update spare part
- `DELETE /api/spare-parts/:id` - Delete spare part

### Stock Operations
- `GET /api/stock-operations` - Get all operations
- `POST /api/stock-operations` - Record stock operation

### Reports
- `GET /api/reports/daily?date=YYYY-MM-DD` - Daily report
- `GET /api/reports/monthly?month=YYYY-MM` - Monthly report

## Database Schema

### spare_parts table
```sql
CREATE TABLE spare_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    quantity INT DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### stock_operations table
```sql
CREATE TABLE stock_operations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('in', 'out') NOT NULL,
    spare_part_id INT NOT NULL,
    quantity INT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id) ON DELETE CASCADE
);
```

## Usage

1. **Manage Spare Parts**: Add new parts, update quantities, edit details
2. **Record Operations**: Log stock movements (in/out) with dates and notes
3. **View Reports**: Check daily stock changes or monthly summaries
4. **Real-time Updates**: Inventory quantities update automatically

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend_project
node server.js
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL server is running
   - Check credentials in `backend_project/server.js`
   - Verify database exists

2. **CORS Errors**
   - Backend is configured with CORS
   - Ensure both servers are running on different ports

3. **API Connection Issues**
   - Check if backend is running on port 5000
   - Verify API_BASE_URL in frontend components

4. **MySQL Installation**
   - Use XAMPP for Windows (includes phpMyAdmin)
   - Use MAMP for macOS
   - Or install MySQL directly

### Database Reset

To reset the database:
```sql
DROP DATABASE Garage_service;
CREATE DATABASE Garage_service;
-- Then re-run the schema from database_schema.sql
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
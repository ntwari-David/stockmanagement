const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const port = 5000;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());


const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Garage_service'
});


conn.connect((err) => {
    if (err) {
        console.log("Error connecting to database:", err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Users CRUD
app.get('/api/users', (req, res) => {
    conn.query('SELECT Userid, UserName, role FROM Users ORDER BY Userid', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/users', (req, res) => {
    const { UserName, Password, role = 'user' } = req.body;
    const sql = 'INSERT INTO Users (UserName, Password, role) VALUES (?, ?, ?)';
    conn.query(sql, [UserName, Password, role], (err, result) => {
        if (err) {
            console.error('Error during creating user:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ Userid: result.insertId, message: 'User created successfully' });
    });
});

app.put('/api/users/:id', (req, res) => {
    const { UserName, Password, role } = req.body;
    const sql = 'UPDATE Users SET UserName = ?, Password = ?, role = ? WHERE Userid = ?';
    conn.query(sql, [UserName, Password, role, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    });
});

app.delete('/api/users/:id', (req, res) => {
    conn.query('DELETE FROM Users WHERE Userid = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

app.post('/api/login', (req, res) => {
    const { UserName, Password, role, adminKey } = req.body;
    if (!UserName || !Password || !role) {
        return res.status(400).json({ error: 'UserName, Password, and role are required' });
    }

    const sql = 'SELECT Userid, UserName, role FROM Users WHERE UserName = ? AND Password = ? LIMIT 1';
    conn.query(sql, [UserName, Password], (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = results[0];
        if (role !== user.role) {
            return res.status(403).json({ error: `This account is registered as ${user.role}. Please login with the correct role.` });
        }
        if (role === 'admin' && adminKey !== 'admin123') {
            return res.status(401).json({ error: 'Invalid admin key' });
        }

        res.json({ user });
    });
});

// Purchased Spare Parts CRUD
app.get('/api/purchased-spareparts', (req, res) => {
    conn.query('SELECT P_id, P_name, quality, total_price FROM Purchasedspareparts ORDER BY P_name', (err, results) => {
        if (err) {
            console.error('Error fetching purchased spare parts:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/api/purchased-spareparts/:id', (req, res) => {
    conn.query('SELECT P_id, P_name, quality, total_price FROM Purchasedspareparts WHERE P_id = ?', [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching purchased spare part:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Purchased spare part not found' });
        }
        res.json(results[0]);
    });
});

app.post('/api/purchased-spareparts', (req, res) => {
    const { P_name, quality, total_price } = req.body;
    const qualityText = String(quality || '').trim();
    const parsedPrice = parseFloat(total_price);

    if (!P_name || typeof P_name !== 'string') {
        return res.status(400).json({ error: 'Spare part name is required' });
    }
    if (!qualityText) {
        return res.status(400).json({ error: 'Quality is required and must be text' });
    }
    if (qualityText.length > 255) {
        return res.status(400).json({ error: 'Quality must be 255 characters or less' });
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Total price must be a non-negative number' });
    }

    const sql = 'INSERT INTO Purchasedspareparts (P_name, quality, total_price) VALUES (?, ?, ?)';
    conn.query(sql, [P_name.trim(), qualityText, parsedPrice], (err, result) => {
        if (err) {
            console.error('Error creating purchased spare part:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ P_id: result.insertId, message: 'Purchased spare part created successfully' });
    });
});

app.put('/api/purchased-spareparts/:id', (req, res) => {
    const { P_name, quality, total_price } = req.body;
    const qualityText = String(quality || '').trim();
    const parsedPrice = parseFloat(total_price);

    if (!P_name || typeof P_name !== 'string') {
        return res.status(400).json({ error: 'Spare part name is required' });
    }
    if (!qualityText) {
        return res.status(400).json({ error: 'Quality is required and must be text' });
    }
    if (qualityText.length > 255) {
        return res.status(400).json({ error: 'Quality must be 255 characters or less' });
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Total price must be a non-negative number' });
    }

    const sql = 'UPDATE Purchasedspareparts SET P_name = ?, quality = ?, total_price = ? WHERE P_id = ?';
    conn.query(sql, [P_name.trim(), qualityText, parsedPrice, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating purchased spare part:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Purchased spare part not found' });
        }
        res.json({ message: 'Purchased spare part updated successfully' });
    });
});

app.delete('/api/purchased-spareparts/:id', (req, res) => {
    // First check if the spare part is referenced in stock operations
    const checkStockIn = 'SELECT COUNT(*) AS count FROM stock_in WHERE P_id = ?';
    const checkStockOut = 'SELECT COUNT(*) AS count FROM stock_out WHERE P_id = ?';

    conn.query(checkStockIn, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error checking stock_in references:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results[0].count > 0) {
            return res.status(400).json({ error: 'Cannot delete spare part: it has associated stock in records' });
        }

        conn.query(checkStockOut, [req.params.id], (err, results) => {
            if (err) {
                console.error('Error checking stock_out references:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (results[0].count > 0) {
                return res.status(400).json({ error: 'Cannot delete spare part: it has associated stock out records' });
            }

            // Safe to delete
            conn.query('DELETE FROM Purchasedspareparts WHERE P_id = ?', [req.params.id], (err, result) => {
                if (err) {
                    console.error('Error deleting purchased spare part:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Purchased spare part not found' });
                }
                res.json({ message: 'Purchased spare part deleted successfully' });
            });
        });
    });
});

// Stock In
app.get('/api/stock-in', (req, res) => {
    const sql = `
        SELECT si.*, ps.P_name AS spare_part_name
        FROM stock_in si
        LEFT JOIN Purchasedspareparts ps ON si.P_id = ps.P_id
        ORDER BY si.date DESC, si.in_id DESC
    `;
    conn.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching stock in records:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/stock-in', (req, res) => {
    const { P_id, quality, date } = req.body;
    const quantity = parseInt(quality, 10);
    if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }

    const checkSql = 'SELECT P_id FROM Purchasedspareparts WHERE P_id = ?';

    conn.query(checkSql, [P_id], (err, results) => {
        if (err) {
            console.error('Error checking purchased spare part for stock in:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Purchased spare part not found' });
        }

        const insertSql = 'INSERT INTO stock_in (date, quality, P_id) VALUES (?, ?, ?)';
        conn.query(insertSql, [date, quantity, P_id], (err, result) => {
            if (err) {
                console.error('Error creating stock in record:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ in_id: result.insertId, message: 'Stock in recorded successfully' });
        });
    });
});

// Stock Out
app.get('/api/stock-out', (req, res) => {
    const sql = `
        SELECT so.*, ps.P_name AS spare_part_name
        FROM stock_out so
        LEFT JOIN Purchasedspareparts ps ON so.P_id = ps.P_id
        ORDER BY so.date DESC, so.out_id DESC
    `;
    conn.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching stock out records:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/stock-out', (req, res) => {
    const { P_id, quality, date } = req.body;
    const quantity = parseInt(quality, 10);
    if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }

    const checkSql = 'SELECT P_id FROM Purchasedspareparts WHERE P_id = ?';

    conn.query(checkSql, [P_id], (err, results) => {
        if (err) {
            console.error('Error checking purchased spare part for stock out:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Purchased spare part not found' });
        }

        // Check if stock in is greater than or equal to stock out
        const stockCheckSql = `
            SELECT 
                COALESCE(SUM(si.quality), 0) AS total_in,
                COALESCE(SUM(so.quality), 0) AS total_out
            FROM stock_in si
            LEFT JOIN stock_out so ON si.P_id = so.P_id
            WHERE si.P_id = ?
        `;

        conn.query(stockCheckSql, [P_id], (err, stockData) => {
            if (err) {
                console.error('Error checking stock availability:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            const totalIn = stockData[0]?.total_in || 0;
            const totalOut = stockData[0]?.total_out || 0;
            const availableStock = totalIn - totalOut;
            const projectedStock = availableStock - quantity;

            if (projectedStock < 0) {
                return res.status(400).json({ 
                    error: `You are stocking out ${quantity} item(s), but only ${availableStock} item(s) are available in stock.` 
                });
            }

            const insertSql = 'INSERT INTO stock_out (date, quality, P_id) VALUES (?, ?, ?)';
            conn.query(insertSql, [date, quantity, P_id], (err, result) => {
                if (err) {
                    console.error('Error creating stock out record:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(201).json({ out_id: result.insertId, message: 'Stock out recorded successfully' });
            });
        });
    });
});

// Combined stock operations view
app.get('/api/stock-operations', (req, res) => {
    const sql = `
        SELECT 'in' AS type, MIN(si.in_id) AS id, si.P_id AS spare_part_id, ps.P_name AS spare_part_name,
            SUM(si.quality) AS quality, si.date
        FROM stock_in si
        LEFT JOIN Purchasedspareparts ps ON si.P_id = ps.P_id
        GROUP BY si.P_id, ps.P_name, si.date
        UNION ALL
        SELECT 'out' AS type, MIN(so.out_id) AS id, so.P_id AS spare_part_id, ps.P_name AS spare_part_name,
            SUM(so.quality) AS quality, so.date
        FROM stock_out so
        LEFT JOIN Purchasedspareparts ps ON so.P_id = ps.P_id
        GROUP BY so.P_id, ps.P_name, so.date
        ORDER BY date DESC, type DESC, spare_part_name
    `;
    conn.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching combined stock operations:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/stock-operations', (req, res) => {
    const { type, P_id, quality, date } = req.body;
    const quantity = parseInt(quality, 10);

    if (!['in', 'out'].includes(type)) {
        return res.status(400).json({ error: 'Type must be either "in" or "out"' });
    }
    if (P_id === undefined || P_id === null || quantity === undefined || quantity === null || !date) {
        return res.status(400).json({ error: 'P_id, quality, and date are required' });
    }
    if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }

    const checkSql = 'SELECT P_id FROM Purchasedspareparts WHERE P_id = ?';
    conn.query(checkSql, [P_id], (err, results) => {
        if (err) {
            console.error('Error checking purchased spare part for stock operation:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Purchased spare part not found' });
        }

        const targetTable = type === 'in' ? 'stock_in' : 'stock_out';
        const idField = type === 'in' ? 'in_id' : 'out_id';

        // For stock out, check if stock in is greater than or equal to stock out
        if (type === 'out') {
            const stockCheckSql = `
                SELECT 
                    COALESCE(SUM(si.quality), 0) AS total_in,
                    COALESCE(SUM(so.quality), 0) AS total_out
                FROM stock_in si
                LEFT JOIN stock_out so ON si.P_id = so.P_id
                WHERE si.P_id = ?
            `;

            conn.query(stockCheckSql, [P_id], (err2, stockData) => {
                if (err2) {
                    console.error('Error checking stock availability:', err2);
                    return res.status(500).json({ error: 'Database error' });
                }

                const totalIn = stockData[0]?.total_in || 0;
                const totalOut = stockData[0]?.total_out || 0;
                const availableStock = totalIn - totalOut;
                const projectedStock = availableStock - quantity;

                if (projectedStock < 0) {
                    return res.status(400).json({ 
                        error: `You are stocking out ${quantity} item(s), but only ${availableStock} item(s) are available in stock.` 
                    });
                }

                proceedWithMergeOrInsert();
            });
        } else {
            proceedWithMergeOrInsert();
        }

        function proceedWithMergeOrInsert() {
            const selectSql = `SELECT ${idField} AS id, quality FROM ${targetTable} WHERE P_id = ? AND date = ?`;

            conn.query(selectSql, [P_id, date], (err2, existingRows) => {
                if (err2) {
                    console.error('Error checking existing stock operations:', err2);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (existingRows.length > 0) {
                    const existingId = existingRows[0].id;
                    const currentTotal = existingRows.reduce((sum, row) => sum + Number(row.quality), 0);
                    const mergedQuantity = currentTotal + quantity;
                    const updateSql = `UPDATE ${targetTable} SET quality = ? WHERE ${idField} = ?`;

                    conn.query(updateSql, [mergedQuantity, existingId], (err3) => {
                        if (err3) {
                            console.error('Error updating duplicate stock operation:', err3);
                            return res.status(500).json({ error: 'Database error' });
                        }

                        if (existingRows.length > 1) {
                            const deleteSql = `DELETE FROM ${targetTable} WHERE ${idField} != ? AND P_id = ? AND date = ?`;
                            conn.query(deleteSql, [existingId, P_id, date], (err4) => {
                                if (err4) {
                                    console.error('Error removing duplicate stock operations:', err4);
                                }
                            });
                        }

                        res.status(200).json({ id: existingId, message: 'Stock operation merged successfully' });
                    });
                } else {
                    const insertSql = `INSERT INTO ${targetTable} (date, quality, P_id) VALUES (?, ?, ?)`;
                    conn.query(insertSql, [date, quantity, P_id], (err3, result) => {
                        if (err3) {
                            console.error('Error creating stock operation:', err3);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        res.status(201).json({ id: result.insertId, message: 'Stock operation recorded successfully' });
                    });
                }
            });
        }

    });
});

// Delete all stock operations
app.delete('/api/stock-operations/all', (req, res) => {
    const deleteSql = 'TRUNCATE TABLE stock_out';
    const deleteSql2 = 'TRUNCATE TABLE stock_in';

    conn.query(deleteSql, (err) => {
        if (err) {
            console.error('Error deleting stock out records:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        conn.query(deleteSql2, (err) => {
            if (err) {
                console.error('Error deleting stock in records:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'All stock operations deleted successfully' });
        });
    });
});

// Reports
app.get('/api/reports/daily', (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
    }

    const sql = `
        SELECT
            ps.P_name AS spare_part,
            COALESCE(SUM(CAST(si.quality AS SIGNED)), 0) AS stock_in,
            COALESCE(SUM(CAST(so.quality AS SIGNED)), 0) AS stock_out,
            COALESCE(SUM(CAST(si.quality AS SIGNED)), 0) - COALESCE(SUM(CAST(so.quality AS SIGNED)), 0) AS net_change
        FROM Purchasedspareparts ps
        LEFT JOIN stock_in si ON ps.P_id = si.P_id AND si.date = ?
        LEFT JOIN stock_out so ON ps.P_id = so.P_id AND so.date = ?
        GROUP BY ps.P_id, ps.P_name
        HAVING stock_in > 0 OR stock_out > 0
        ORDER BY ps.P_name
    `;

    conn.query(sql, [date, date], (err, results) => {
        if (err) {
            console.error('Error generating daily report:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/api/reports/monthly', (req, res) => {
    const { month } = req.query;
    if (!month) {
        return res.status(400).json({ error: 'Month parameter is required' });
    }

    const sql = `
        SELECT
            ps.P_name AS spare_part,
            COALESCE(SUM(CAST(si.quality AS SIGNED)), 0) AS total_stock_in,
            COALESCE(SUM(CAST(so.quality AS SIGNED)), 0) AS total_stock_out,
            COALESCE(SUM(CAST(si.quality AS SIGNED)), 0) - COALESCE(SUM(CAST(so.quality AS SIGNED)), 0) AS net_change
        FROM Purchasedspareparts ps
        LEFT JOIN stock_in si ON ps.P_id = si.P_id AND DATE_FORMAT(si.date, '%Y-%m') = ?
        LEFT JOIN stock_out so ON ps.P_id = so.P_id AND DATE_FORMAT(so.date, '%Y-%m') = ?
        GROUP BY ps.P_id, ps.P_name
        ORDER BY ps.P_name
    `;

    conn.query(sql, [month, month], (err, results) => {
        if (err) {
            console.error('Error generating monthly report:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
require('dotenv').config();
const express = require('express');
const pool = require('./db');

const PharmacyRouter = require('./router/pharmacyRouter');
const UserRouter = require('./router/userRouter');
const TransactionRouter = require('./router/transactionRouter');
const SearchRouter = require('./router/searchRouter');
const PurchaseRouter = require('./router/purchaseRouter');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use('/api/v1/pharmacies', PharmacyRouter);
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/transactions', TransactionRouter);
app.use('/api/v1/search', SearchRouter);
app.use('/api/v1/purchase', PurchaseRouter);

async function startServer() {
    try {
        await pool.query('SELECT 1');
        console.log('Database connection established successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error establishing database connection:', error.message);
        process.exit(1);
    }
}

startServer();

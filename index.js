const express = require('express');
const connectDB = require('./config/db'); // Assuming connectDB is in the config folder
const UserRouter = require('./routes/UserRouter');

const app = express();
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set in .env

app.use(express.json());
connectDB();

app.get('/', (req, res) => {
    res.send("Hello world");
});

app.use('/api/user', UserRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

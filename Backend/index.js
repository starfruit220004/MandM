const express = require('express');
const cors = require('cors');
const { seedDatabase } = require('./seed');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Seed the database and start the server
seedDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});

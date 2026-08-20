require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
require('./database'); // ensures DB gets initialized

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

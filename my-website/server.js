const express = require('express');
const path = require('path');

const app = express();
const PORT = 80; // Use port 80 for HTTP

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

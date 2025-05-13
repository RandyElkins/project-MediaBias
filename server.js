const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();
const port = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.static('.'));  // Serve static files from current directory

// Initialize the database
const db = new sqlite3.Database('./media_sources.db');

// Create the media_sources table
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS media_sources (
      id INTEGER PRIMARY KEY,
      moniker_name TEXT NOT NULL,
      domain TEXT NOT NULL,
      reliability_mean REAL NOT NULL,
      reliability_label TEXT NOT NULL,
      bias_mean REAL NOT NULL,
      bias_label TEXT NOT NULL
    )
  `);

    // Add your sample data initially
    const stmt = db.prepare(`
    INSERT OR IGNORE INTO media_sources (id, moniker_name, domain, reliability_mean, reliability_label, bias_mean, bias_label)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    // Sample data
    const sources = [
        [1, 'Tangle', '.readtangle.com', 43.03508789, 'Reliable; Analysis/Fact Reporting', 1.575758182, 'Middle'],
        [2, 'Ed Source', '.edsource.org', 44.64706, 'Reliable; Analysis/Fact Reporting', -4.1583325, 'Middle'],
        [3, 'Anti-Defamation League', '.adl.org', 44.244444, 'Reliable; Analysis/Fact Reporting', -4.986109167, 'Middle'],
        [4, 'Human Events', '.humanevents.com', 20.66203625, 'Unreliable; Problematic', 18.49656376, 'Hyper-Partisan Right'],
        [5, 'Columbia Journalism Review', '.cjr.org', 43.32608739, 'Reliable; Analysis/Fact Reporting', -6.261666, 'Skews Left']
    ];

    sources.forEach(source => {
        stmt.run(source);
    });

    stmt.finalize();
});

// Configure file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

const upload = multer({ storage: storage });

// API Endpoints
app.get('/api/media-sources', (req, res) => {
    db.all("SELECT * FROM media_sources", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
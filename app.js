const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('database.db');

// Create the 'shops' table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      subdomain TEXT
    )
  `);
});

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/form.html');
});

app.post('/', (req, res) => {
  const name = req.body.name;
  const subdomain = req.body.subdomain;

  // Save the shop details to SQLite
  const query = `INSERT INTO shops (name, subdomain) VALUES (?, ?)`;
  db.run(query, [name, subdomain], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error occurred while saving shop details.');
    } else {
      res.render('succese', { name }, { subdomain });
    }
  });
});

app.get('*', (req, res) => {
  const subdomain = req.headers.host.split('.')[0];

  // Load shop details for the given subdomain from SQLite
  const query = `SELECT name FROM shops WHERE subdomain = ?`;
  db.get(query, [subdomain], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error occurred while fetching shop details.');
    } else {
      const name = row ? row.name : '';
      res.render('index', { name });
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

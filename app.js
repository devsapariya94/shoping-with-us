const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));





app.get('*', (req, res) => {
    const host = req.headers.host;
    const subdomain = host.split('.')[0];

    if (subdomain === 'www') {
        //render form.html
        res.sendFile(__dirname + '/form.html');
    }
    else {
    const query = `SELECT name FROM shops WHERE subdomain = ?`;
    db.get(query, [subdomain], (err, row) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error occurred while fetching shop details.');
      } 
      else if (!row) {
        res.status(404).send('Shop not found.');
        }

      else {
        const name = row ? row.name : '';
  
        // Check if no path is specified
        if (req.originalUrl === '/') {
          res.render('subdomain', { name });
        } else {
          res.status(404).send('Not Found');
        }
      }
    });

    }
  });
  

  app.post('/create', (req, res) => {
    const { name, subdomain } = req.body;

    //check for unique subdomain

    const query = `SELECT id FROM shops WHERE subdomain = ?`;
    db.get(query, [subdomain], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error occurred while fetching shop details.');
        } else if (row) {
            res.status(400).send('Shop already exists.');
        }
    });


    const insert_query = `INSERT INTO shops (name, subdomain) VALUES (?, ?)`;
    db.run(insert_query, [name, subdomain], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error occurred while creating the shop.');
        } else {
            res.render('succese', { name , subdomain});
        }
    });
});


app.get('/contact', (req, res) => {
    const subdomain = req.headers.host.split('.')[0];
  
    // Load shop details for the given subdomain from SQLite
    const query = `SELECT name FROM shops WHERE subdomain = ?`;
    db.get(query, [subdomain], (err, row) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error occurred while fetching shop details.');
      } else {
        const name = row ? row.name : '';
        res.render('contact', { name });
      }
    });
  });


app.listen(3000, () => {
  console.log('Server started on port 3000');
});

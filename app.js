const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      subdomain TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER,
      mobile TEXT,
      email TEXT,
      address TEXT,
      FOREIGN KEY (shop_id) REFERENCES shops(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER,
      image TEXT,
      name TEXT,
      price REAL,
      FOREIGN KEY (shop_id) REFERENCES shops(id)
    )
  `);
});

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('*', (req, res, next) => {
  const host = req.headers.host;
  const subdomain = host.split('.')[0];

  if (subdomain === 'www') {
    next(); // Proceed to the next middleware (form.html)
  } else {
   
    const query = `SELECT name FROM shops WHERE subdomain = ?`;
    db.get(query, [subdomain], (err, row) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error occurred while fetching shop details.');
      } else if (!row) {
        res.status(404).send('Shop not found.');
      } else {
        const name = row ? row.name : '';
        const mobile = row ? row.mobile : '';
        const email = row ? row.email : '';
        const address = row ? row.address : '';
        
        const query = `SELECT image, name, price FROM products WHERE shop_id = ?`;
        db.all(query, [row.id], (err, rows) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error occurred while fetching product details.');
          } else {
            const products = rows ? rows : [];
            if (req.originalUrl === '/') {
              console.log(products);
              res.render('index', { name, products, mobile, email, address });
            }
            else if (req.originalUrl === '/contact') {
              res.render('contact', { name, products, mobile, email, address });
            }
  
            else {
              next();
          }
     
      }
    });
  }});}});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/form.html');db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS shops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        subdomain TEXT
      )
    `);
  });
  
});



  

app.post('/create', (req, res) => {
  const { name, subdomain, mobile, email, address, productImage, productName, productPrice } = req.body;
  console.log(req.body);
  console.log(productImage);
  // Check for unique subdomain
  const query = `SELECT id FROM shops WHERE subdomain = ?`;
  db.get(query, [subdomain], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error occurred while fetching shop details.');
    } else if (row) {
      res.status(400).send('Shop already exists.');
    } else {
      // Insert shop details into the database
      const insertShopQuery = `INSERT INTO shops (name, subdomain) VALUES (?, ?)`;
      db.run(insertShopQuery, [name, subdomain], function (err) {
        if (err) {
          console.error(err);
          res.status(500).send('Error occurred while creating the shop.');
        } else {
          // Retrieve the last inserted shop ID
          const shopId = this.lastID;

          // Insert product details into the database
          const insertProductQuery = `INSERT INTO products (shop_id, image, name, price) VALUES (?, ?, ?, ?)`;
          const productValues = [];

          // Prepare the values for multiple products
          for (let i = 0; i < productName.length; i++) {
            productValues.push([shopId, productImage[i], productName[i], productPrice[i]]);
          }

          // Execute the product insertion query
          db.run(insertProductQuery, productValues, function (err) {
            if (err) {
              console.error(err);
              res.status(500).send('Error occurred while inserting product details.');
            } else {
              // Render success page
              res.render('success', { name, subdomain, mobile, email, address });
            }
          });
        }
      });
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

  app.use((req, res) => {
    res.status(404).send('Not Found');
  });
  
app.listen(3000, () => {
  console.log('Server started on port 3000');
});

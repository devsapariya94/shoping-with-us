const express = require('express');






const path = require('path');
const bodyParser = require('body-parser');
const { name } = require('ejs');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/create', (req, res) => {
  const productValues = [];

  // Extract the product name and price from the request body
  const productNames = req.body.productName;
  const productPrices = req.body.productPrice;
  const productImages = req.body.productImage;
  // Print the product name and price
  for (let i = 0; i < productNames.length; i++) {
    console.log('Product Name:', productNames[i]);
    console.log('Product Price:', productPrices[i]);
    console.log('Product Image:', productImages[i]);
    console.log('------------------------');

    productValues.push(`('${productNames[i]}', ${productPrices[i]}, '${productImages[i]}')`);
  }
  console.log(productValues);
  const name = req.body.name;
  const subdomain = req.body.subdomain;
  const mobile = req.body.mobile;
  const email = req.body.email;
  const address = req.body.address;

  addShop(name, subdomain, mobile, email, address, productValues, res);
});






const sqlite3 = require('sqlite3').verbose();


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
app.use(bodyParser.urlencoded({ extended: true }));

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
      }
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/form.html'); db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS shops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        subdomain TEXT
      )
    `);
  });

});




addShop = (name, subdomain, mobile, email, address, productValues, res) => {
  console.log('Adding shop to database...');
  console.log (productValues)
  const query = `INSERT INTO shops (name, subdomain) VALUES (?, ?)`;
  db.run(query, [name, subdomain], function (err) {
    if (err) {
      console.error(err);
      res.status(500).send('Error occurred while adding shop.');
    } else {
      const shopId = this.lastID;

      const query = `INSERT INTO contacts (shop_id, mobile, email, address) VALUES (?, ?, ?, ?)`;
      db.run(query, [shopId, mobile, email, address], function (err) {
        if (err) {
          console.error(err);
          res.status(500).send('Error occurred while adding contact.');
        } else {
          const query = `INSERT INTO products (shop_id, name, price, image) VALUES (?, ?, ?, ?)`;
          const productParams = productValues.map((product) => [shopId, product.name, product.price, product.image]);
          
          db.run(query, function (err) {
            if (err) {
              console.error(err);
              res.status(500).send('Error occurred while adding products.');
            } else {
              res.render('success', {name, mobile, email, address, subdomain });
            }
          });
        }
      });
    }
  });
};







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

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Handle the form submission
app.post('/create', (req, res) => {
  // Extract the product name and price from the request body
  const productNames = req.body.productName;
  const productPrices = req.body.productPrice;

  // Print the product name and price
  for (let i = 0; i < productNames.length; i++) {
    console.log('Product Name:', productNames[i]);
    console.log('Product Price:', productPrices[i]);
    console.log('------------------------');
  }

  // Send a response back to the client
  res.send('Product details received successfully');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

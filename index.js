const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');
const productsRouter = require('./routes/admin/products');

const app = express();

// We call app.use and pass in a middleware function when
// we want all of our route handlers to have the middleware applied.
app.use(express.static('public'));  // make everything in public folder available over the internet
app.use(bodyParser.urlencoded({ 
  extended: true 
}));
app.use(cookieSession({
  keys: ['v8cn7qwef84c9mywsf']  // to encrypt cookies
}));

// hook up route handlers located in external files
app.use(authRouter);
app.use(productsRouter);


// ------------------------DON NOT REMOVE--------------------------

app.listen(3000, () => {
  console.log('Listening');
});

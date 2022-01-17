const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

/* sample cart =
    {
      id: 987,
      items: [
        { id: 123, quantity: 1 },
        { id: 456, quantity: 3 }
      ]
    }
    (outer id = cartId, inner id = productId)
  */

// Receive a POST request to add an item to a cart
router.post('/cart/products', async (req, res) => {

  // Do we have an existing cart for this user? or do we create a new one for them?
  let cart;
  if (!req.session.cartId) {
    // we don't have a cart, we need to create one,
    // and store the cart id on the req.session.cartId property
    cart = await cartsRepo.create({ items: [] });
    req.session.cartId = cart.id;
  } else {
    // we have a cart! Lets get it from the repository
    cart = await cartsRepo.getOne(req.session.cartId);
  }

  // Either increment quantity for exisiting product 
  // Or add new product to items array
  const existingItem = cart.items.find(item => item.id === req.body.productId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.items.push({ 
      id: req.body.productId,
      quantity: 1
    });
  }

  // Save cart to repo
  await cartsRepo.update(cart.id, {
    items: cart.items
  });

  // Send response
  res.redirect('/cart');
});

// Receive a GET request to show all items in cart
router.get('/cart', async (req, res) => {
  // make sure user has a cart
  if (!req.session.cartId) {
    return res.redirect('/');
  }

  // get cart from repo
  const cart = await cartsRepo.getOne(req.session.cartId);

  // iterate over array of items
  for (let item of cart.items) {
    // make a request to each item to get objects
    const product = await productsRepo.getOne(item.id);
    item.product = product;
  }

  res.send(cartShowTemplate({ items: cart.items }));
});

// Receive a POST request to delete an item from a cart
router.post('/cart/products/delete', async (req, res) => {
  const { productId } = req.body;
  const cart = await cartsRepo.getOne(req.session.cartId);

  const items = cart.items.filter(item => item.id !== productId);
  await cartsRepo.update(req.session.cartId, { items });

  res.redirect('/cart');
});

module.exports = router;

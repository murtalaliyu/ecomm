const express = require('express');
const carts = require('../repositories/carts');
const cartsRepo = require('../repositories/carts');

const router = express.Router();

// Receive a POST request to add an item to a cart
router.post('/cart/products', async (req, res) => {
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
  res.send('Product added');
});

// Receive a GET request to show all items in cart


// Receive a POST request to delete an item from a cart


module.exports = router;

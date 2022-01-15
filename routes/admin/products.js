// External
const express = require('express');
const multer = require('multer'); // for handling files in a form

// Internal
const { handleErrors, requireAuth } = require('./middlewares');
const productsRepo = require('../../repositories/products');
const productsNewTemplate = require('../../views/admin/products/new');
const productsIndexTemplate = require('../../views/admin/products/index');
const productsEditTemplate = require('../../views/admin/products/edit');
const { requireTitle, requirePrice } = require('./validators');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // middleware

router.get('/admin/products', requireAuth, async (req, res) => {
  const products = await productsRepo.getAll();
  res.send(productsIndexTemplate({ products }));
});

router.get('/admin/products/new', requireAuth, (req, res) => {
  res.send(productsNewTemplate({}));
});

router.post(
  '/admin/products/new',
  requireAuth,
  upload.single('image'),
  [requireTitle, requirePrice],
  handleErrors(productsNewTemplate),
async (req, res) => {
  // console.log(req.file);
  let image;
  try {
    image = req.file.buffer.toString('base64');
  } catch (err) {
    image = '';
  }
  const { title, price } = req.body;

  // create a new product
  await productsRepo.create({ title, price, image });
  
  // get image raw data
  // req.on('data', data => {
  //   console.log(data.toString());
  // });

  res.redirect('/admin/products');
});

router.get('/admin/products/:id/edit', requireAuth, async (req, res) => {
  const { id } = req.params;
  const product = await productsRepo.getOne(id);

  // make sure product exists
  if (!product) {
    return res.send('Product not found');
  }

  res.send(productsEditTemplate({ product }));
});

router.post('/admin/products/:id/edit', 
  requireAuth,
  upload.single('image'),
  [requireTitle, requirePrice], // validators
  handleErrors(productsEditTemplate, async (req) => {
    const product = await productsRepo.getOne(req.params.id);
    return { product };
  }),
async (req, res) => {
  const changes = req.body;

  if (req.file) {
    changes.image = req.file.buffer.toString('base64');
  }

  try {
    await productsRepo.update(req.params.id, changes);
  } catch (err) {
    return res.send('Could not find item');
  }

  res.redirect('/admin/products');
});


// ----------------------
module.exports = router;

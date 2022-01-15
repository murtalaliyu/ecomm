const express = require('express');

const { handleErrors } = require('./middlewares');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { requireEmail, requirePassword, requirePasswordConfirmation, requireEmailExists, requireValidPasswordForUser } = require('./validators');

const router = express.Router();

// With the GET request, when the user submits the form below,
// the input data will be appended to the URL as query strings,
// provided the name field is added.
router.get('/signup', (req, res) => {
  res.send(signupTemplate({ req }));
});

// With the POST request, the input data is available as form data/body.
// We are using an imported version of body parser as a middleware.
router.post(
  '/signup',
  [requireEmail, requirePassword, /*requirePasswordConfirmation*/],
  handleErrors(signupTemplate),
async (req, res) => {
  // Get access to email/pass.
  const { email, password } = req.body;

  // Create a user in our user repo to represent this person
  const user = await usersRepo.create({ email, password });

  // Store the id of that user inside the user's cookie
  req.session.userId = user.id;

  res.redirect('/admin/products');
});

router.get('/signout', (req, res) => {
  req.session = null;
  res.send('You are logged out');
});

router.get('/signin', (req, res) => {
  res.send(signinTemplate({}));
});

router.post(
  '/signin',
  [requireEmailExists, requireValidPasswordForUser],
  handleErrors(signinTemplate),
async (req, res) => {
  const { email } = req.body;

  const user = await usersRepo.getOneBy({ email });

  req.session.userId = user.id;
  res.redirect('/admin/products');
});

// -------------------------------------------------------
module.exports = router;




// ----------------------------------------------------------------------

// Apparently we have to write the code to tell node to wait until
// all body data has been receieved before running the callback below.
// This is a middleware. on = addEventListener.
// const bodyParser = (req, res, next) => {
//   if (req.method === 'POST') {
//     req.on('data', data => {
//       const parsed = data.toString('utf8').split('&');
//       const formData = {};

//       for (let pair of parsed) {
//         const [key, value] = pair.split('=');
//         formData[key] = value;
//       }
//       req.body = formData;
//       next();
//     });
//   } else {
//     next();
//   }
// };

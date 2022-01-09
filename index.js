const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const usersRepo = require('./repositories/users');

const app = express();

// We call app.use and pass in a middleware function when
// we want all of our route handlers to have the middleware applied.
app.use(bodyParser.urlencoded({ 
  extended: true 
}));
app.use(cookieSession({
  keys: ['v8cn7qwef84c9mywsf']  // to encrypt cookies
}));

// With the GET request, when the user submits the form below,
// the input data will be appended to the URL as query strings,
// provided the name field is added.
app.get('/signup', (req, res) => {
  res.send(`
    <div>
      Your id is: ${req.session.userId}
      <form method="POST">
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" />
        <input name="passwordConfirmation" placeholder="password confirmation" />

        <button>Sign Up</button>
      </form>
    </div>
  `);
});

// With the POST request, the input data is available as form data/body.
// We are using an imported version of body parser as a middleware.
app.post('/signup', async (req, res) => {
  // Get access to email/pass/conf.
  const { email, password, passwordConfirmation } = req.body;
  
  const existingUser = await usersRepo.getOneBy({ email });
  
  // validation
  if (existingUser) {
    return res.send('Email in use');
  }
  if (password !== passwordConfirmation) {
    return res.send('Passwords must match');
  }

  // Create a user in our user repo to represent this person
  const user = await usersRepo.create({ email, password });

  // Store the id of that user inside the user's cookie
  req.session.userId = user.id;

  res.send({
    message: 'Account created!!!',
    user
  });
});

app.get('/signout', (req, res) => {
  req.session = null;
  res.send('You are logged out');
});

app.get('/signin', (req, res) => {
  res.send(`
    <div>
      <form method="POST">
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" />

        <button>Sign In</button>
      </form>
    </div>
  `);
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepo.getOneBy({ email });

  if (!user) {
    return res.send('Email not found');
  }

  const validPassword = await usersRepo.comparePasswords(
    user.password,
    password
  );
  if (!validPassword) {
    return res.send('Invalid password');
  }

  req.session.userId = user.id;
  res.send('You are signed in!!!');
});

app.listen(3000, () => {
  console.log('Listening');
});





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
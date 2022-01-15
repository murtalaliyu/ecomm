const { validationResult } = require('express-validator');

// All middlewares must be functions
module.exports = {
  handleErrors(templateFunc, dataCallBack) {
    return async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        let data = {};
        if (dataCallBack) {
          data = await dataCallBack(req);
        }
        return res.send(templateFunc({ errors, ...data }));
      }
      next();
    };
  },

  requireAuth(req, res, next) {
    if (!req.session.userId) {
      // throw new Error('Unauthorized access. Please login/signup');
      return res.redirect('/signin');
    }
    next();
  }
};

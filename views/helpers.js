module.exports = {
  getError(errors, prop) {
    // prop = 'email' || 'password' || 'passwordConfirmation'
    try {
      return errors.mapped()[prop].msg;
      /*
        errors.mapped() = {
          email: {
            msg: '...invalid email'
          },
          password: {
            msg: '...password too short'
          },
          passwordConfirmation: {
            msg: '...passwords must match'
          }
        }
      */
    } catch (err) {
      return '';
    }
  }
};

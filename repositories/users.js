const fs = require("fs");
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  async create(attrs) {
    // attrs = { email: 'asdf@asd.csadf', password: 'asfsaga' }    
    attrs.id = this.randomId();

    // hash and salt password
    const salt = crypto.randomBytes(8).toString('hex');
    const buf = await scrypt(attrs.password, salt, 64);
    // finalPass = [hashed(pass+salt)].[salt]

    // get latest version of users
    const records = await this.getAll();
    // add attrs to array of users
    const record = {
      ...attrs,
      password: `${buf.toString('hex')}.${salt}`
    };
    records.push(record);
    // write updated array back to this.filename
    await this.writeAll(records);

    return record;
  }

  // saved    -> password saved in our database as [hashed].[salt]
  // supplied -> password given to us by a user trying to sign in
  async comparePasswords(saved, supplied) {
    const [hashed, salt] = saved.split('.');
    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);
    return hashed === hashedSuppliedBuf.toString('hex');
  }
}

module.exports = new UsersRepository('users.json');







// const test = async () => {
//   const repo = new UsersRepository('users.json');
//   // await repo.create({ email: 'test1@test.com', password: 'password' });
//   // const users = await repo.getAll();
//   // console.log(users);

//   // const user = await repo.getOne('uvuv');
//   // console.log(user);

//   // await repo.delete('');
//   // const users = await repo.getAll();
//   // console.log(users);

//   // await repo.update('0e831476', {username: 'MEEP'});

//   const user = await repo.getOneBy({ id: '02dbad2c' });
//   console.log(user);
// }

// test();

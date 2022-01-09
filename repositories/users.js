const fs = require("fs");
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
  constructor(filename) {
    if (!filename) {
      throw new Error('Creating a repository requires a filename');
    }

    this.filename = filename;
    // check if file exists
    try {
      fs.accessSync(this.filename);  
    } catch (err) {
      // if not, create a new file
      fs.writeFileSync(this.filename, '[]');
    }
  }

  async getAll() {
    // Open the file called this.filename
    const contents = await fs.promises.readFile(this.filename, { encoding: 'utf8'});
    // Read its contents
    // console.log(contents);
    // Parse the contents
    const data = JSON.parse(contents);
    // Return the parsed data
    return data;
  }

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

  async writeAll(records) {
    await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
  }

  randomId() {
    return crypto.randomBytes(4).toString('hex');
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find(record => record.id === id);
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter(record => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find(record => record.id === id);
    
    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }

    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) { // array iter
      let found = true;

      for (let key in filters) {  // obj iter
        if (record[key] !== filters[key]) {
          found = false;
        }
      }

      if (found) {
        return record;
      }
    }
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

const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRespository extends Repository {
    async comparePassword(saved, supplied) {
        //saved -> password in database
        //supplied -> password given by user trying to login

        // const result = saved.spit('.');
        // const hashed = result[0];
        // const salt = result[1];

        const [hashed, salt] = saved.split('.');
        const hashedSuplliedBuf = await scrypt(supplied, salt, 64);

        return hashed === hashedSuplliedBuf.toString('hex');
    }

    async create(attrs) {

        attrs.id = this.randomId();

        const salt = crypto.randomBytes(8).toString('hex');
        const buf = await scrypt(attrs.password, salt, 64);

        const records = await this.getAll();
        const record = {
            ...attrs, // create a new obj and override existing props with new props
            password: `${buf.toString('hex')}.${salt}`
        }
        records.push(record);

        await this.writeAll(records);

        return attrs;
    }
}


module.exports = new UsersRespository('users.json');
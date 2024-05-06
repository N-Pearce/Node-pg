const {Pool} = require('pg')

const DB_URI = (process.env.NODE_ENV === 'test')
    ? 'biztime_test'
    : 'biztime';

let pool = new Pool({
    database: DB_URI,
    password: process.env.PASSWORD,
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    idleTimeoutMillis: 9000,
    connectionTimeoutMillis: 9000
});

module.exports = pool; 
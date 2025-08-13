require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


const dbConnection = pool.promise();
// Test the connection
(async()=>{
    try{
        await dbConnection.query('SELECT 1');
        console.log('Connected to the database');
    } catch(error){
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
})()


module.exports = dbConnection;

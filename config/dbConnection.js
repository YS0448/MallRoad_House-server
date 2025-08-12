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
    } catch(err){
        console.log('Error connecting to the database:', err);
        process.exit(1);
    }
})()


module.exports = dbConnection;

// --------------------------------------------------------------
// promisePool.query('SELECT 1')
//     .then(()=>{
//         console.log('Connected to the database');
//     })
//     .catch((err)=>{
//         console.log('Error connecting to the database:', err);
//     })

// --------------------------------------------------------------
// --------------------------------------------------------------
// --------------------------------------------------------------

// const express = require('express');
// const mysql = require('mysql2');

// const dbConnection = mysql.createConnection({
//     host:'localhost',
//     user:'root',
//     password:'Nomistake@4579',
//     database:'frame_craft'
// })



// dbConnection.connect((err)=>{
//     if(err){
//         console.log('Error connecting to the database:', err);
//     }
//     else{
//         console.log('Connected to the database');
//     }
// })


// module.exports = dbConnection;




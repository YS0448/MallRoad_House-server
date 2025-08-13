const con = require('../../config/dbConnection');

let executeQuery = async (query, params=[]) => {
    try{
        const [rows] = await con.query(query, params);
        return rows;
    }
    catch(err){
        console.error('Error executing query:', err);
        throw err;
    }
}


module.exports = {executeQuery}
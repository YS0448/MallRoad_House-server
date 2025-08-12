const {executeQuery} = require('../../utils/db/dbUtils');

const getGalleryItems = async(req,res)=>{
    try{
        const sql = ` SELECT * FROM gallery `;
        const result = await executeQuery(sql);
        return res.status(200).json({ data: result });
    }
    catch(error){
        console.error("Error fetching gallery items:", error);
        return res.status(500).json({ message: "Failed to fetch gallery items." });
    }
}


module.exports = { getGalleryItems };
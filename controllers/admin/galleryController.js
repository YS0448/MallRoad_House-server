const {executeQuery} = require('../../utils/db/dbUtils');
const uploadGalleryImage = require('../../utils/uploadMedia/uploadGalleryImage');
const { getUTCDateTime } = require('../../utils/date/dateUtils');

const addGalleryImage= async(req,res)=>{
    try{    
        const {image_name, description} = req.body;
        // Upload Image
        const imagePath = await uploadGalleryImage(req.files.image);
        const sql = `
            INSERT INTO gallery
            (image_name, image_path, description, updated_at, created_at)
            VALUES (?, ?, ?, ?, ?)
            `;
        const values = [
            image_name, 
            imagePath,
            description,
            getUTCDateTime(),
            getUTCDateTime(),
        ];
        await executeQuery(sql, values);
       // Respond to the client
        return res.status(201).json({message: "Gallery image added successfully."});
    
    }catch(error){
        console.error("Error adding gallery image:", error);
        return res.status(500).json({ message: "Failed to add gallery image." });
    }
}

module.exports = { addGalleryImage };
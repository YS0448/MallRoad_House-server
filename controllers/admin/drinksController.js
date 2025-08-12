const uploadImage = require("../../utils/uploadMedia/uploadImage");
const { executeQuery } = require("../../utils/db/dbUtils"); // adjust if needed
const { getUTCDateTime } = require("../../utils/date/dateUtils"); // adjust if needed

const createDrinksMenu = async (req, res) => {
  try {
    const { category, drinks_name, description, status } = req.body;

    // === ✅ Validation ===
    if (!category || !drinks_name || !description || !status) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image is required." });
    }

    // === ✅ Upload Image ===
    const imagePath = await uploadImage(req.files.image);

    // === ✅ Prepare Data ===
    const currentDateTime = getUTCDateTime();

    const sql = `
      INSERT INTO drinks_menu 
      (category_name, item_name, description, image_path, status, updated_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      category,
      drinks_name,
      description,
      imagePath,      
      status,
      currentDateTime,
      currentDateTime,
    ];

    // === ✅ Insert into DB ===
    await executeQuery(sql, values);

    // === ✅ Respond ===
    return res.status(201).json({
      message: "Drinks item created successfully.",
    });
  } catch (error) {
    console.error("Error in createDrinksItem:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
};


const getDrinksCatogories = async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT category_name
      FROM drinks_menu            
    `;
    const result = await executeQuery(sql);

    const categories = result.map(row => row.category_name); // Flatten to array of strings

    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Error in getCatogories:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
};


module.exports = { createDrinksMenu, getDrinksCatogories };

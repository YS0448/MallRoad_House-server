const uploadImage = require("../../utils/uploadMedia/uploadImage");
const { executeQuery } = require("../../utils/db/dbUtils"); // adjust if needed
const { getUTCDateTime } = require("../../utils/date/dateUtils"); // adjust if needed

const createTakeAwayMenu = async (req, res) => {
  try {
    const { category, food_name, price, description, status } = req.body;
    const allergens = JSON.parse(req.body.allergens || "[]"); // ["FISH", "DAIRY"]
    const allergens_icons = allergens.join(",");

    // === ✅ Validation ===
    if (!category || !food_name || !price || !description || !status) {
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
      INSERT INTO takeaway_menu 
      (category_name, item_name, description, image_path, allergens_icons, price, status, updated_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      category,
      food_name,
      description,
      imagePath,
      allergens_icons,
      price,
      status,
      currentDateTime,
      currentDateTime,
    ];

    // === ✅ Insert into DB ===
    await executeQuery(sql, values);

    // === ✅ Respond ===
    return res.status(201).json({
      message: "Takeaway item created successfully.",
    });
  } catch (error) {
    console.error("Error in createTakeAwayItem:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
};


const getTakeawayCatogories = async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT category_name
      FROM takeaway_menu            
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


module.exports = { createTakeAwayMenu, getTakeawayCatogories };

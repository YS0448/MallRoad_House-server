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


// ✅ Get all takeaway items
// ✅ Get all takeaway items with pagination & search
const getTakeawayMenu = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 5; // items per page
    const search = req.query.search ? `%${req.query.search}%` : '%';

    // Count total items matching search
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM takeaway_menu 
      WHERE category_name LIKE ? OR item_name LIKE ?
    `;
    const countResult = await executeQuery(countQuery, [search, search]);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    // Fetch paginated & filtered items
    const query = `
      SELECT * 
      FROM takeaway_menu
      WHERE category_name LIKE ? OR item_name LIKE ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await executeQuery(query, [search, search, limit, offset]);

    res.json({
      items: rows,
      totalPages,
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    console.error("Error fetching takeaway menu:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ Update takeaway item
const updateTakeawayMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_name,
      item_name,
      description,
      image_path,
      allergens_icons,
      price,
      status,
    } = req.body;

    const fields = [];
    const values = [];

    // Only include fields that are present in the request
    if (category_name !== undefined) { fields.push("category_name=?"); values.push(category_name); }
    if (item_name !== undefined) { fields.push("item_name=?"); values.push(item_name); }
    if (description !== undefined) { fields.push("description=?"); values.push(description); }
    if (allergens_icons !== undefined) { fields.push("allergens_icons=?"); values.push(allergens_icons); }
    if (price !== undefined) { fields.push("price=?"); values.push(price); }
    if (status !== undefined) { fields.push("status=?"); values.push(status); }

    // Handle image separately
    const image = req?.files?.image;
    if (image) {
      const imagePath = await uploadImage(image);
      fields.push("image_path=?");
      values.push(imagePath);
    }

    // Always update updated_at
    fields.push("updated_at=?");
    values.push(getUTCDateTime());

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const query = `UPDATE takeaway_menu SET ${fields.join(", ")} WHERE meal_id=?`;
    values.push(id);

    await executeQuery(query, values);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createTakeAwayMenu, getTakeawayCatogories, getTakeawayMenu, updateTakeawayMenu };

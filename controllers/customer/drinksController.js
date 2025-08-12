const { executeQuery } = require("../../utils/db/dbUtils");

const getDrinksMenu = async (req, res) => {
  try {
    const limit = 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const searchPattern = `%${search}%`;

    const getDrinksMenuQry = `
      SELECT 
          item_id,
          category_name,
          item_name,
          description,
          image_path,                
          status                
      FROM drinks_menu 
      WHERE item_name LIKE ?
      ORDER BY category_name DESC
      LIMIT ? OFFSET ?
    `;

    const params = [searchPattern, limit, offset];
    const items = await executeQuery(getDrinksMenuQry, params);

    return res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching drinks menu:", err);
    return res.status(500).json({ message: "Failed to fetch menu." });
  }
};

module.exports = { getDrinksMenu };

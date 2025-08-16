const { executeQuery } = require("../../utils/db/dbUtils");

const getDiningMenu = async (req, res) => {
  try {
    const limit = 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const searchPattern = `%${search}%`;

    const getDiningMenuQry = `
      SELECT 
          item_id,
          category_name,
          item_name,
          description,
          image_path,
          allergens_icons,
          price,
          status                
      FROM dining_menu 
      WHERE item_name LIKE ? OR category_name LIKE ?
      ORDER BY category_name DESC
      LIMIT ? OFFSET ?
    `;
    const params = [searchPattern, searchPattern, limit, offset];

    const items = await executeQuery(getDiningMenuQry, params);
    return res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching dining menu:", err);
    return res.status(500).json({ message: "Failed to fetch menu." });
  }
};

module.exports = { getDiningMenu };

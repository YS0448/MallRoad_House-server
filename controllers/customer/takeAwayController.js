const { executeQuery } = require("../../utils/db/dbUtils");

const getTakeawayMenu = async (req, res) => {
  try {
    const limit = 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const user_id = req.query.user_id || 0;
    const search = req.query.search || ""; // get search query param

    let getTakeawayMenuQry;
    let params;

    // Prepare search pattern for LIKE
    const searchPattern = `%${search}%`;

    if (!user_id || user_id === "null") {
      getTakeawayMenuQry = `
        SELECT 
          item_id,
          category_name,
          item_name,
          description,
          image_path,
          allergens_icons,
          price,
          status                
        FROM takeaway_menu
        WHERE item_name LIKE ?
        ORDER BY category_name DESC
        LIMIT ? OFFSET ?
      `;
      params = [searchPattern, limit, offset];
    } else {
      getTakeawayMenuQry = `
        SELECT 
          tkm.item_id,
          tkm.category_name,
          tkm.item_name,
          tkm.description,
          tkm.image_path,
          tkm.allergens_icons,
          tkm.price,
          tkm.status,
          COALESCE(c.number_of_items, 0) AS number_of_items,
          c.cart_id
        FROM takeaway_menu tkm
        LEFT JOIN cart c 
          ON tkm.item_id = c.item_id AND c.user_id = ?
        WHERE tkm.item_name LIKE ?
        ORDER BY tkm.category_name, tkm.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [user_id, searchPattern, limit, offset];
    }

    const items = await executeQuery(getTakeawayMenuQry, params);
    return res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching takeaway menu:", err);
    return res.status(500).json({ message: "Failed to fetch menu." });
  }
};

module.exports = { getTakeawayMenu };

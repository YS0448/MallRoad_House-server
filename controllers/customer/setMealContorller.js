const { executeQuery } = require("../../utils/db/dbUtils");

const getSetMealMenu = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    console.log('user_id:', user_id);
    let getQry = ` 
            SELECT 
                s_memu.set_meal_id, 
                s_memu.set_meal_name, 
                s_memu.price, 
                s_memu.image_path, 
                s_memu.status,                
                s_item.set_meal_item_id,                  
                s_item.category_name, 
                s_item.item_name, 
                s_item.max_choices, 
                s_item.extra_charge,
                c.description,                 
                c.quantity,
                c.cart_id                 
            FROM set_meal_menu s_memu
                LEFT JOIN set_meal_items s_item ON
                s_memu.set_meal_id = s_item.set_meal_id
                LEFT JOIN cart c ON
                s_memu.set_meal_id = c.set_meal_id AND 
                c.user_id = ?                
            WHERE s_memu.status IN (?, ?) 
            `;
    let value = [user_id, "out_of_stock", "available"];
    let result = await executeQuery(getQry, value);


// Group meals & their categories
const mealsMap = {};
result.forEach(row => {
  if (!mealsMap[row.set_meal_id]) {
    mealsMap[row.set_meal_id] = {
      set_meal_id: row.set_meal_id,
      set_meal_name: row.set_meal_name,
      price: row.price,
      image_path: row.image_path,
      status: row.status,
      description: JSON.parse(row.description),
      quantity: row.quantity,
      cart_id: row.cart_id,
      categories: {}
    };
  }

  if (row.set_meal_item_id) {
    const meal = mealsMap[row.set_meal_id];

    if (!meal.categories[row.category_name]) {
      // ✅ category object with max_choices
      meal.categories[row.category_name] = {
        max_choices: row.max_choices,
        items: []
      };
    }

    meal.categories[row.category_name].items.push({
      set_meal_item_id: row.set_meal_item_id,
      item_name: row.item_name,
      extra_charge: row.extra_charge
    });
  }
});

const formattedData = Object.values(mealsMap);


    console.log('formattedData:', formattedData);

    res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error("error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

module.exports = {
  getSetMealMenu,
};

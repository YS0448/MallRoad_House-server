const { executeQuery } = require("../../utils/db/dbUtils");
const { getUTCDateTime } = require("../../utils/date/dateUtils");

const addToCart = async (req, res) => {
  try {
    const { meal_id, quantity, description, menu_type } = req.body;
    const user_id = req.user.user_id;
    // validation
    if (!meal_id || !quantity || !description || !menu_type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let checkItemStatusQuery;
    let params;

    if (menu_type === "takeaway") {
      checkItemStatusQuery =
        "SELECT status FROM takeaway_menu WHERE meal_id = ? ";
    } else {
      checkItemStatusQuery =
        "SELECT status FROM set_meal_menu WHERE set_meal_id = ? ";
    }
    // check status of item before adding to cart
    params = [meal_id];

    const itemStatus = await executeQuery(checkItemStatusQuery, params);
    console.log("itemStatus:", itemStatus);
    if (!itemStatus || itemStatus.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (itemStatus[0].status === "out_of_stock") {
      return res.status(422).json({ message: "Item is out of stock" });
    }
    if (itemStatus[0].status === "deactivated") {
      return res.status(403).json({ message: "Item is deactivated" });
    }

    // Check if item already exists in cart
    let checkCartQuery;
    if (menu_type === "takeaway") {
      checkCartQuery =
        "SELECT quantity FROM cart WHERE user_id = ? AND meal_id = ?";
    } else {
      checkCartQuery =
        "SELECT quantity FROM cart WHERE user_id = ? AND set_meal_id = ?";
    }
    const cartItem = await executeQuery(checkCartQuery, [user_id, meal_id]);

    if (cartItem && cartItem.length > 0) {
      res.status(409).json({ message: "Meal already exist in cart" });
    } else {
      // Insert new item into cart
      let addToCartQuery;
      if (menu_type === "takeaway") {
        addToCartQuery =
          "INSERT INTO cart (user_id, meal_id, quantity, description, menu_type ,created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
      } else {
        addToCartQuery =
          "INSERT INTO cart (user_id, set_meal_id, quantity, description, menu_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
      }
      const currentDateTime = getUTCDateTime();
      params = [
        user_id,
        meal_id,
        quantity,
        description,
        menu_type,
        currentDateTime,
        currentDateTime,
      ];

      let result = await executeQuery(addToCartQuery, params);
      res
        .status(201)
        .json({ cart_id: result.insertId, message: "Item added to cart" });
    }
  } catch (error) {
    console.error("Error in /cart/add:", error);
    res.status(500).json({ message: "Server error" });
  }
};




    // // 1. Get Takeaway cart items
    // const cartItemsFromTKMQuery = `
    //   SELECT
    //     c.cart_id,
    //     c.meal_id,
    //     tkm.item_name AS name,
    //     tkm.price,
    //     tkm.image_path,
    //     tkm.allergens_icons,
    //     c.quantity,
    //     c.description,
    //     'takeaway' AS menu_type
    //   FROM cart c
    //   JOIN takeaway_menu tkm ON c.meal_id = tkm.meal_id
    //   WHERE c.user_id = ? AND c.menu_type = 'takeaway';
    // `;
    // const TKMResult = await executeQuery(cartItemsFromTKMQuery, [user_id]);

    // // 2. Get Set Meal cart items
    // const cartItemsFromSetMenuQuery = `
    //   SELECT
    //     c.cart_id,
    //     c.set_meal_id,
    //     smm.set_meal_name AS name,
    //     smm.price,
    //     smm.image_path,
    //     c.quantity,
    //     c.description,
    //     'set_meal' AS menu_type
    //   FROM cart c
    //   JOIN set_meal_menu smm ON c.set_meal_id = smm.set_meal_id
    //   WHERE c.user_id = ? AND c.menu_type = 'set_meal';
    // `;
    // const SetMealResult = await executeQuery(cartItemsFromSetMenuQuery, [user_id]);

    // // Merge items
    // const items = [...TKMResult, ...SetMealResult];




const getAddToCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;


    const cartItemsQuery = `
      SELECT 
          c.cart_id,
          c.meal_id,
          tkm.item_name AS item_name,
          tkm.price,
          tkm.image_path,
          tkm.allergens_icons,
          c.quantity,
          c.description,
          c.menu_type
      FROM cart c
      JOIN takeaway_menu tkm 
          ON c.meal_id = tkm.meal_id
      WHERE c.user_id = ? AND c.menu_type = ?

      UNION ALL

      SELECT 
          c.cart_id,
          c.set_meal_id AS meal_id,
          smm.set_meal_name AS item_name,
          smm.price,
          smm.image_path,
          NULL AS allergens_icons,
          c.quantity,
          c.description,
          c.menu_type
      FROM cart c
      JOIN set_meal_menu smm 
          ON c.set_meal_id = smm.set_meal_id
      WHERE c.user_id = ? AND c.menu_type = ?;
    `;
    let params;
    
    params= [
      user_id,
      "takeaway", // params for first SELECT
      user_id,
      "set_meal", // params for second SELECT
    ]

    const items = await executeQuery(cartItemsQuery, params);
    // console.log("items:", items);

    
// Calculate extra charges
const getExtraChargeTotal = (selectedItems) => {
  let total = 0;

  Object.values(selectedItems).forEach((selected) => {
    [...selected.normal, ...selected.extra].forEach((item) => {
      if (item && Number(item.extra_charge) > 0) {
        total += Number(item.extra_charge);
      }
    });
  });

  return total;
};



    
for (const item of items) {
  if (item.menu_type === "set_meal") {
    const description = JSON.parse(item.description);

    let set_meal_item_qry = `
      SELECT set_meal_item_id, set_meal_id, category_name, item_name, extra_charge 
      FROM set_meal_items
    `;
    let meal_item_result = await executeQuery(set_meal_item_qry);

    // Map IDs -> item object for faster lookup
    const itemMap = {};
    meal_item_result.forEach((it) => {
      itemMap[String(it.set_meal_item_id)] = {
        id: it.set_meal_item_id,
        name: it.item_name,
        extra_charge: Number(it.extra_charge) || 0
      };
    });

    // Enrich description with names
    Object.entries(description).forEach(([cat, selected]) => {
      description[cat].normal = selected.normal.map((id) => itemMap[String(id)] || { id, name: null, extra_charge: 0 });
      description[cat].extra = selected.extra.map((id) => itemMap[String(id)] || { id, name: null, extra_charge: 0 });
    });

    console.log("Updated description:", description);

    // ✅ Now pass only description
    let result = getExtraChargeTotal(description);
    item.extra_charge = String(result);

    // Replace with enriched description
    item.description = description;
  }
}




    // 3. Get unified totals across BOTH menus
    const totalsQuery = `
      SELECT 
        COUNT(*) AS totalCount,
        SUM(quantity) AS totalItems,
        SUM(
          CASE 
            WHEN menu_type = 'takeaway' THEN quantity * (SELECT price FROM takeaway_menu WHERE meal_id = c.meal_id)
            WHEN menu_type = 'set_meal' THEN quantity * (SELECT price FROM set_meal_menu WHERE set_meal_id = c.set_meal_id)
          END
        ) AS totalAmount
      FROM cart c
      WHERE c.user_id = ?;
    `;
    const totalsResult = await executeQuery(totalsQuery, [user_id]);
    const totals = totalsResult[0] || {
      totalCount: 0,
      totalItems: 0,
      totalAmount: 0,
    };

    return res.status(200).json({
      items,
      totalCount: totals.totalCount || 0,
      totalItems: totals.totalItems || 0,
      totalAmount: Number(totals.totalAmount) || 0,
    });
  } catch (error) {
    console.error("Error in /cart:", error);
    return res.status(500).json({ error: "Failed to fetch cart data" });
  }
};










const removeFromCart = async (req, res) => {
  try {
    const cart_id = req.params.cart_id;
    // Ensure meal_id is provided
    if (!cart_id) {
      return res.status(400).json({ message: "Cart ID is required" });
    }

    const user_id = req.user.user_id;
    const deleteCartQuery =
      "DELETE FROM cart WHERE user_id = ? AND cart_id = ?";
    const result = await executeQuery(deleteCartQuery, [user_id, cart_id]);
    console.log('result:', result);

    // Check if any row was affected by the delete operation
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Item removed from cart" });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    console.error("Error in /cart/delete:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCartItem = async (req, res) => {
  const { cart_id } = req.params;
  const { quantity, description } = req.body;
  console.log('description:', description);
  const user_id = req.user.user_id;

  try {
    if (quantity <= 0) {
      // Delete the row
      const deleteQuery = `DELETE FROM cart WHERE cart_id = ? AND user_id = ?`;
      const deleteResult = await executeQuery(deleteQuery, [cart_id, user_id]);

      if (deleteResult.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Cart item not found or unauthorized" });
      }

      return res.status(200).json({ message: "Cart item removed" });
    }

    // Update quantity
    let updateQuery;
    let params;
    
    if(description && quantity){
      updateQuery = `
        UPDATE cart SET quantity = ?, description = ?, updated_at = ? WHERE cart_id = ? AND user_id = ?
      `;
      params=[ quantity, description, getUTCDateTime(), cart_id, user_id ]

    }else{
      updateQuery = `
        UPDATE cart SET quantity = ?, updated_at = ? WHERE cart_id = ? AND user_id = ?
      `;
      params=[ quantity, getUTCDateTime(), cart_id, user_id ]
    }


    const updateResult = await executeQuery(updateQuery, params);
    console.log('updateResult:', updateResult);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: "Cart item not found or unauthorized" });
    }

    res.status(200).json({ message: "Cart item updated", quantity });
  } catch (error) {
    console.error("Error updating/removing cart item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addToCart, getAddToCart, removeFromCart, updateCartItem };

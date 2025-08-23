const {executeQuery} = require('../db/dbUtils');

// Check availability of items
async function checkItemsAvailability(items) {
  for (const item of items) {
    const { meal_id } = item;
    if (!meal_id) throw new Error("Item ID is required for each item");

    const query = "SELECT status FROM takeaway_menu WHERE meal_id = ?";
    const result = await executeQuery(query, [meal_id]);

    if (!result || result.length === 0) {
      throw new Error(`Item with ID ${meal_id} not found`);
    }

    if (result[0].status !== "available") {
      throw new Error(`Item with ID ${meal_id} is not available`);
    }
  }
}

// Insert order header and return inserted order_id
async function insertOrderHeader(user_id, shippingData, paymentMethod, totalAmount, createdAt, updatedAt) {
  console.log('user_id, shippingData, paymentMethod, totalAmount, createdAt, updatedAt:', user_id, shippingData, paymentMethod, totalAmount, createdAt, updatedAt);
  const { fullName, phoneNumber, pinCode, address, landmark } = shippingData;

  const insertOrderQuery = `
    INSERT INTO orders (
      user_id, full_name, phone_no, pin_code, delivery_address, land_mark,
      payment_method, status, total_amount, updated_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    user_id, fullName, phoneNumber, pinCode, address, landmark || null,
    paymentMethod, "pending", totalAmount, updatedAt, createdAt
  ];

  const result = await executeQuery(insertOrderQuery, params);
  return result.insertId;
}

// Insert all order items
async function insertOrderItems(orderId, items, createdAt, updatedAt) {
  let insertItemQuery;    
  let params;

  for (const item of items) {
    const { meal_id, item_name, quantity, price, extra_charge, description, menu_type } = item;
    const desc = JSON.stringify(description); 

    if (!quantity || quantity <= 0) {
      throw new Error("Number of items must be greater than 0");
    }

    const per_item_price = parseFloat(Number(price) + Number(extra_charge));
    const total_price = per_item_price * quantity;

    insertItemQuery = `
      INSERT INTO order_items (
        order_id, meal_id, set_meal_id, item_name, description, quantity, per_item_price, total_price, menu_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  if(menu_type ==="takeaway"){
    
    params = [
      orderId,
      meal_id,
      null,
      item_name,
      desc,
      quantity,
      per_item_price,
      total_price,
      menu_type,
      createdAt,
      updatedAt,
    ];

  } else if(menu_type ==="set_meal"){

    params = [
      orderId,
      null,
      meal_id,
      item_name,
      desc,
      quantity,
      per_item_price,
      total_price,
      menu_type,
      createdAt,
      updatedAt,
    ];

  } else{
    
  }

    let insertResult= await executeQuery(insertItemQuery, params);  
  }


}

async function deleteItemsFromCart(user_id, items) {

  let deleteQuery;
  for (const item of items) {

    const { cart_id } = item;
    if (!cart_id) continue; // safety

    if(cart_id){
      deleteQuery = `DELETE FROM cart WHERE user_id = ? AND cart_id = ?`;
    }

    await executeQuery(deleteQuery, [user_id, cart_id]);
  }
}

module.exports = {
  checkItemsAvailability,
  insertOrderHeader,
  insertOrderItems,
  deleteItemsFromCart
};
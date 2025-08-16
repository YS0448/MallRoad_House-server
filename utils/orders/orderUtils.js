const {executeQuery} = require('../db/dbUtils');

// Check availability of items
async function checkItemsAvailability(items) {
  for (const item of items) {
    const { item_id } = item;
    if (!item_id) throw new Error("Item ID is required for each item");

    const query = "SELECT status FROM takeaway_menu WHERE item_id = ?";
    const result = await executeQuery(query, [item_id]);

    if (!result || result.length === 0) {
      throw new Error(`Item with ID ${item_id} not found`);
    }

    if (result[0].status !== "available") {
      throw new Error(`Item with ID ${item_id} is not available`);
    }
  }
}

// Insert order header and return inserted order_id
async function insertOrderHeader(user_id, shippingData, paymentMethod, totalAmount, createdAt, updatedAt) {
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
  const insertItemQuery = `
    INSERT INTO order_items (
      order_id, item_id, item_name, quantity, per_item_price, total_price, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const item of items) {
    const { item_id, item_name, quantity, price } = item;

    if (!quantity || quantity <= 0) {
      throw new Error("Number of items must be greater than 0");
    }

    const per_item_price = parseFloat(price);
    const total_price = per_item_price * quantity;

    const params = [
      orderId,
      item_id,
      item_name,
      quantity,
      per_item_price,
      total_price,
      createdAt,
      updatedAt,
    ];

    await executeQuery(insertItemQuery, params);
  }
}

async function deleteItemsFromCart(user_id, items) {
  // Extract all cart_ids from items that exist in cart, or delete by user_id and item_id
  // Assuming `items` have `item_id` and `quantity` (no cart_id), we'll delete by user_id + item_id

  for (const item of items) {

    const { item_id } = item;
    if (!item_id) continue; // safety

    const deleteQuery = `DELETE FROM cart WHERE user_id = ? AND item_id = ?`;
    await executeQuery(deleteQuery, [user_id, item_id]);
  }
}

module.exports = {
  checkItemsAvailability,
  insertOrderHeader,
  insertOrderItems,
  deleteItemsFromCart
};
const {
  checkItemsAvailability,
  insertOrderHeader,
  insertOrderItems,
  deleteItemsFromCart
} = require("../../utils/orders/orderUtils");


const {executeQuery} = require('../../utils/db/dbUtils');   
const {getUTCDateTime} = require("../../utils/date/dateUtils");

const placeOrder = async (req, res) => {
  try {
    const { items, shippingData, paymentMethod, totalAmount } = req.body;
    const user_id = req?.user?.user_id || null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    const { fullName, phoneNumber, pinCode, address } = shippingData;
    if (!fullName || !phoneNumber || !pinCode || !address) {
      return res.status(400).json({ message: "Incomplete shipping data" });
    }

    const createdAt = getUTCDateTime();
    const updatedAt = createdAt;

    await checkItemsAvailability(items);

    const orderId = await insertOrderHeader(user_id, shippingData, paymentMethod, totalAmount, createdAt, updatedAt);

    await insertOrderItems(orderId, items, createdAt, updatedAt);

    // *** Delete ordered items from cart here ***
    if (user_id) {
      await deleteItemsFromCart(user_id, items);
    }

    return res.status(201).json({
      message: "Order placed successfully",
      orderId,
    });
  } catch (error) {
    console.error("Error in /order/place:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};


const myOrders = async (req, res) => {
  try {
    const user_id = req?.user?.user_id || null;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;

    const getOrdersQuery = `
      SELECT 
        o.order_id,
        o.status,
        o.created_at,
        oi.order_item_id,
        oi.number_of_items,
        oi.per_item_price,
        oi.total_price,
        tkm.item_name        
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN takeaway_menu tkm ON oi.item_id = tkm.item_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC, oi.order_item_id ASC
      LIMIT ? OFFSET ?
    `;

    const rows = await executeQuery(getOrdersQuery, [user_id, limit, offset]);

    const ordersMap = new Map();

    for (const row of rows) {
      const {
        order_id,
        status,
        created_at,
        order_item_id,
        number_of_items,
        per_item_price,
        total_price,
        item_name,
      } = row;

      if (!ordersMap.has(order_id)) {
        ordersMap.set(order_id, {
          order_id,
          status,
          created_at,
          items: [],
        });
      }

      if (order_item_id) {
        ordersMap.get(order_id).items.push({
          order_item_id,
          number_of_items,
          per_item_price: parseFloat(per_item_price),
          total_price: parseFloat(total_price),
          item_name,  // <-- Include item_name here
        });
      }
    }

    const orders = Array.from(ordersMap.values());

    return res.status(200).json({ data: orders });
  } catch (error) {
    console.error("Error in /order/my:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};


module.exports = { placeOrder, myOrders };
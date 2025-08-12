const {executeQuery} = require('../../utils/db/dbUtils');

const getDashboardData = async (req, res) => {
  try {
    // Total Orders
    const totalOrdersQuery = `
      SELECT COUNT(*) AS totalOrders
      FROM orders
    `;
    const totalOrdersResult = await executeQuery(totalOrdersQuery);
    const totalOrders = totalOrdersResult[0]?.totalOrders || 0;

    // Revenue (sum of all delivered orders)
    const revenueQuery = `
      SELECT COALESCE(SUM(total_amount), 0) AS revenue
      FROM orders
      WHERE status = 'delivered'
    `;
    const revenueResult = await executeQuery(revenueQuery);
    const revenue = revenueResult[0]?.revenue || 0;

    // Active Items in takeaway_menu
    const activeItemsQuery = `
      SELECT COUNT(*) AS activeItems
      FROM takeaway_menu
      WHERE status = 'available'
    `;
    const activeItemsResult = await executeQuery(activeItemsQuery);
    const activeItems = activeItemsResult[0]?.activeItems || 0;

    // Pending Orders
    const pendingOrdersQuery = `
      SELECT COUNT(*) AS pendingOrders
      FROM orders
      WHERE status = 'pending'
    `;
    const pendingOrdersResult = await executeQuery(pendingOrdersQuery);
    const pendingOrders = pendingOrdersResult[0]?.pendingOrders || 0;

    // Recent 10 Orders
    const recentOrdersQuery = `
      SELECT 
        o.order_id AS id,
        o.full_name AS customer,
        o.total_amount AS total,
        o.status,
        DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i:%s') AS date
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      ORDER BY o.created_at DESC
      LIMIT 10
    `;
    const recentOrders = await executeQuery(recentOrdersQuery);

    // Send Response
    res.status(200).json({
      totalOrders,
      revenue,
      activeItems,
      pendingOrders,
      recentOrders
    });
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getDashboardData };

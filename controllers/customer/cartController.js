const {executeQuery} = require('../../utils/db/dbUtils');   
const {getUTCDateTime} = require('../../utils/date/dateUtils');

const addToCart= async (req,res)=>{
    try{
        const { item_id, quantity} = req.body;
        const user_id = req.user.user_id;

        // check status of item before adding to cart
        const checkItemStatusQuery = "SELECT status FROM takeaway_menu WHERE item_id = ? ";
        const itemStatus = await executeQuery(checkItemStatusQuery, [item_id]);
        if (!itemStatus || itemStatus.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (itemStatus[0].status === 'out_of_stock') {
            return res.status(400).json({ message: 'Item is out of stock' });
        }
        if (itemStatus[0].status === 'deactivated') {
            return res.status(400).json({ message: 'Item is deactivated' });
        }

        // Check if item already exists in cart
        const checkCartQuery = "SELECT quantity FROM cart WHERE user_id = ? AND item_id = ?";
        const cartItem = await executeQuery(checkCartQuery, [user_id, item_id]);
        if (cartItem && cartItem.length > 0) {
            // Update the quantity
            const updateCartQuery = "UPDATE cart SET quantity = quantity + ?, updated_at = ? WHERE user_id = ? AND item_id = ?";
            const result= await executeQuery(updateCartQuery, [quantity, getUTCDateTime(), user_id, item_id]);
            res.status(200).json({ message: 'Cart updated successfully' });
        } else {
            // Insert new item into cart
            const addToCartQuery = "INSERT INTO cart (user_id, item_id, quantity, created_at, updated_at) VALUES (?,?,?,?,?)";
            let result = await executeQuery(addToCartQuery, [user_id, item_id, quantity, getUTCDateTime(), getUTCDateTime()]);
            res.status(200).json({ cart_id:result.insertId, message: 'Item added to cart' });
        }




    }catch(error){
        console.error('Error in /cart/add:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// const getAddToCart= async(req,res)=>{
//     try{
//         const user_id = req.user.user_id;
//         const cartDataQuery = `
//             SELECT c.item_id, c.cart_id, tkm.item_name, tkm.price, tkm.image_path, tkm.allergens_icons, c.quantity 
//             FROM cart c JOIN takeaway_menu tkm ON
//                 c.item_id = tkm.item_id 
//             WHERE c.user_id =?`;
//         const cartData = await executeQuery(cartDataQuery, [user_id]);
//         return res.status(200).json(cartData );    
//     }catch(error){
//         console.error('Error in /cart/data:', error);
//         return [];
//     }
// }
// const getAddToCart = async (req, res) => {
//   try {
//     const user_id = req.user.user_id;

//     // pagination params
//     let page = parseInt(req.query.page) || 1;
//     let limit = parseInt(req.query.limit) || 20;
//     let offset = (page - 1) * limit;

//     // get total count
//     const countQuery = `SELECT COUNT(*) AS totalCount FROM cart WHERE user_id = ?`;
//     const countResult = await executeQuery(countQuery, [user_id]);
//     const totalCount = countResult[0]?.totalCount || 0;

//     // get paginated items
//     const cartDataQuery = `
//       SELECT c.item_id, c.cart_id, tkm.item_name, tkm.price, tkm.image_path, tkm.allergens_icons, c.quantity 
//       FROM cart c 
//       JOIN takeaway_menu tkm ON c.item_id = tkm.item_id 
//       WHERE c.user_id = ?
//       LIMIT ? OFFSET ?
//     `;
//     const cartData = await executeQuery(cartDataQuery, [user_id, limit, offset]);

//     return res.status(200).json({
//       items: cartData,
//       totalCount: totalCount
//     });

//   } catch (error) {
//     console.error("Error in /cart/data:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
const getAddToCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // 1. Get all cart items for the user
    const cartItemsQuery = `
      SELECT 
        c.item_id, 
        c.cart_id, 
        tkm.item_name, 
        tkm.price, 
        tkm.image_path, 
        tkm.allergens_icons, 
        c.quantity
      FROM cart c
      JOIN takeaway_menu tkm ON c.item_id = tkm.item_id
      WHERE c.user_id = ?;
    `;
    const items = await executeQuery(cartItemsQuery, [user_id]);

    // 2. Get totals
    const totalsQuery = `
      SELECT 
        COUNT(*) AS totalCount, 
        SUM(c.quantity) AS totalItems,
        SUM(c.quantity * tkm.price) AS totalAmount
      FROM cart c
      JOIN takeaway_menu tkm ON c.item_id = tkm.item_id
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

const removeFromCart= async(req,res)=>{
    try {
        const cart_id =  req.params.cart_id;
        // Ensure item_id is provided
        if (!cart_id) {
            return res.status(400).json({ message: 'Cart ID is required' });
        }

        const user_id = req.user.user_id;
        const deleteCartQuery = "DELETE FROM cart WHERE user_id = ? AND cart_id = ?";
        const result = await executeQuery(deleteCartQuery, [user_id, cart_id]);

        // Check if any row was affected by the delete operation
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Item removed from cart' });
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }

    } catch (error) {
        console.error('Error in /cart/delete:', error);
        res.status(500).json({ message: 'Server error' });
    }
}



const updateCartItem = async (req, res) => {
  const { cart_id } = req.params;
  const { quantity } = req.body;
  const user_id = req.user.user_id;

  if (quantity < 0) {
    return res.status(400).json({ error: "quantity cannot be negative" });
  }

  try {
    if (quantity === 0) {
      // Delete the row
      const deleteQuery = `DELETE FROM cart WHERE cart_id = ? AND user_id = ?`;
      const deleteResult = await executeQuery(deleteQuery, [cart_id, user_id]);

      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      return res.status(200).json({ message: "Cart item removed" });
    }

    // Update quantity
    const updateQuery = `
      UPDATE cart 
      SET quantity = ?, updated_at = ?
      WHERE cart_id = ? AND user_id = ?
    `;
    const updateResult = await executeQuery(updateQuery, [quantity, getUTCDateTime(), cart_id, user_id]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.status(200).json({ message: "Cart item updated" });
  } catch (error) {
    console.error("Error updating/removing cart item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports={addToCart, getAddToCart, removeFromCart, updateCartItem}
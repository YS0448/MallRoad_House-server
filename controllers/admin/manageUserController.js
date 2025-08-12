// controllers/admin/userController.js
const { executeQuery } = require("../../utils/db/dbUtils");

// controllers/admin/userController.js
const getAllUserDetails = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;

        // Extract query params
        let { page = 1, limit = 10, search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const offset = (page - 1) * limit;

        // Build base query
        let baseQuery = `
            SELECT 
                user_id, 
                full_name, 
                email, 
                role, 
                last_login_at, 
                created_at, 
                status
            FROM users
            WHERE user_id != ?
        `;

        let countQuery = `
            SELECT COUNT(*) as total FROM users
            WHERE user_id != ?
        `;

        const params = [currentUserId];
        const countParams = [currentUserId];

        // Add search filter if provided
        if (search.trim()) {
            baseQuery += ` AND (full_name LIKE ? OR email LIKE ? OR role LIKE ?)`;
            // countQuery += ` AND (full_name LIKE ? OR email LIKE ? OR role LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            // countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Add order and pagination
        baseQuery += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        const users = await executeQuery(baseQuery, params);
        const countResult = await executeQuery(countQuery, countParams);

        res.status(200).json({
            success: true,
            data: users,
            totalUsers: countResult[0].total,
            page,
            limit
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching users"
        });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { status } = req.body; // Expecting "Active" or "Inactive"

        // Update user status in the database
        await executeQuery(
            `UPDATE users SET status = ? WHERE user_id = ?`,
            [status, user_id]
        );

        res.json({
            success: true,
            message: `User status updated to ${status} successfully`
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user status"
        });
    }
};

module.exports = { getAllUserDetails, toggleUserStatus };

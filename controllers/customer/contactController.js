const {getUTCDateTime} = require('../../utils/date/dateUtils');
const validateContactUsFields = require('../../utils/validation/validateContactUsFields');
const {executeQuery} = require('../../utils/db/dbUtils');

const contactUs = async (req, res) => {
  try {
    const { full_name, email, phone_no, message, captcha_answer , user_id, role } = req.body;

    if (captcha_answer !== req.session.captcha) {
        return res.status(400).json({ message: "Captcha is not matched" }); 
    }
    
    const checkUserQuery = "SELECT user_id FROM users WHERE email =?";
    const user = await executeQuery(checkUserQuery, [email]);
    if (user[0] && user[0].user_id !== user_id) { 
        return res.status(400).json({ message: "Email already exists. Please Login First to send message." }); 
    }

    // Step 2: Validate input fields
    const validation = validateContactUsFields({ full_name, email, phone_no, message, role });
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const currentTime = getUTCDateTime();

    // Step 3: Store contact message in the database
    const qry = `
      INSERT INTO contact_messages 
      (full_name, email, phone_no, message, user_id, created_at, role) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [full_name, email, phone_no, message, user_id || null, currentTime, role];
    const result = await executeQuery(qry, params);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Failed to send message" });
    }

    res.status(200).json({ message: "Your message has been sent successfully!" });

  } catch (error) {
    console.error("Error during contact us:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {contactUs};
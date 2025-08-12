const {executeQuery} = require("../../utils/db/dbUtils");
const { getUTCDateTime } = require("../../utils/date/dateUtils");

const reservations = async (req, res) => {
  try {
    const { full_name, email, phone_no, message, date, time, captcha_answer } =
      req.body;

    // Check required fields
    if (!full_name || !email || !phone_no || !captcha_answer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ 1. Verify CAPTCHA
    if (captcha_answer !== req.session.captcha) {
      return res.status(400).json({ message: "Captcha is not matched" });
    }

    // ✅ 2. Insert reservation into DB
    const query = `
  INSERT INTO reservations 
    (full_name, email, phone_no, message, date, time, status, created_at)  
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

    const params = [
      full_name,
      email,
      phone_no,
      message || null,
      date || null,
      time || null,
      "pending",
      getUTCDateTime(),
    ];
    const result = await executeQuery(query, params);

    // ✅ 3. Success response
    res.status(201).json({ message: "Reservation successful" });
  } catch (error) {
    console.error("Reservation error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { reservations };

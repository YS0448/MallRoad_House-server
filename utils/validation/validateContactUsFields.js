const validateContactUsFields = (data) => {
  const { full_name, email, phone_no, message, role} = data;

  // Check required fields
  if (!full_name || !email || !phone_no || !message || !role) {
    return { valid: false, message: "All fields are required" };
  }

  // Validate email format
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Invalid email format" };
  }

  // Optional: Validate phone number (basic 10-digit check)
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  if (!phoneRegex.test(phone_no)) {
    return { valid: false, message: "Invalid phone number" };
  }

  // If everything is valid
  return { valid: true };
};

module.exports = validateContactUsFields;

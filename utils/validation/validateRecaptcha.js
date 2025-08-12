const axios = require('axios');

const validateRecaptcha = async (token) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Set this in your .env file

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    console.log('response:', response);
    console.log('response.data.success;:', response.data.success)
    return response.data.success;
  } catch (error) {
    console.error('Error validating reCAPTCHA:', error.message);
    return false;
  }
};

module.exports = validateRecaptcha;

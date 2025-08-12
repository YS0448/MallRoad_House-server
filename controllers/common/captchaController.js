const svgCaptcha = require("svg-captcha");

const captcha = async (req, res) => {
  const captcha = svgCaptcha.create();

  try {
    
    req.session.captcha = captcha.text;
    console.log(req.session.captcha)
    res.status(200).json({
      data: captcha.data, // the SVG image
    });

  } catch (error) {
    console.error("Error generating captcha:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = captcha;
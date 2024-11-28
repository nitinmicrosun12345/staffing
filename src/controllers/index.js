const { signup, login, excelFile } = require("../services/index");

const signupController = async (req, res) => {
  try {
    const response = await signup(req);
    return res.status(response.status).json({
      message: response.message,
      user: response.user || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginController = async (req, res) => {
  try {
    const response = await login(req);
    return res.status(response.status).json({
      message: response.message,
      token: response.token || null, // Include token if applicable
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const excelFileController = async (req, res) => {
  try {
    const response = await excelFile(req,res);
    console.log('response',response);
    return res.status(response.status).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { signupController, loginController,excelFileController };

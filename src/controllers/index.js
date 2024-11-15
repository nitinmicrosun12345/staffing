const { signup, login } = require("../services/index");

const signupController = async (req, res) => {
  try {
    const response = await signup(req, res);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginController = async (req, res) => {
  try {
    const response = await login(req, res);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signupController, loginController };

const {
  getMe,
  logout,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUserViaRequest,
  requestUserDeletion,
  getDeletionRequests,
  dashboard,
  deleteUserDirect,
  updateSelf,
  monthlySalary,
} = require("../services/user");

// Controller functions

const getMeController = async (req, res) => {
  try {
    const response = await getMe(req);
    return res.status(response.status).json({
      message: response.message,
      user: response.user || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const logoutController = async (req, res) => {
  try {
    const response = await logout(req, res);
    return res.status(response.status).json({
      message: response.message,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUsersController = async (req, res) => {
  try {
    const response = await getAllUsers(req,res);
    return res.status(response.status).json({
      message: response.message,
      users: response.users || [],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserController = async (req, res) => {
  try {
    const response = await getUser(req);
    return res.status(response.status).json({
      message: response.message,
      user: response.user || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createUserController = async (req, res) => {
  try {
    const response = await createUser(req);
    return res.status(response.status).json({
      message: response.message,
      user: response.user || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserController = async (req, res) => {
  try {
    const response = await updateUser(req);
    return res.status(response.status).json({
      message: response.message,
      user: response.user || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUserViaRequestController = async (req, res) => {
  try {
    const response = await deleteUserViaRequest(req,res);
    return res.status(response.status).json({
      message: response.message,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const requestUserDeletionController = async (req, res) => {
  try {
    const response = await requestUserDeletion(req);
    return res.status(response.status).json({
      message: response.message,
      deletionRequest: response.deletionRequest || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDeletionRequestsController = async (req, res) => {
  try {
    const response = await getDeletionRequests(req,res);
    return res.status(response.status).json({
      message: response.message,
      deletionRequests: response.deletionRequests || [],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const dashboardController = async (req, res) => {
  try {
    const response = await dashboard(req, res);
    return res.status(response.status).json({
      message: response.message,
      data: response.data || {},
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUserDirectController = async (req, res) => {
  try {
    const response = await deleteUserDirect(req);
    return res.status(response.status).json({
      message: response.message,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateSelfController = async (req, res) => {
  try {
    const response = await updateSelf(req, res);
    return res.status(response.status).json({
      message: response.message,
      user: response.user || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const monthlySalaryController = async (req, res) => {
  try {
    const response = await monthlySalary(req,res);
    return res.status(response.status).json({
      message: response.message,
      data: response.data || {},
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// Exporting controller functions
module.exports = {
  getMeController,
  logoutController,
  getAllUsersController,
  getUserController,
  createUserController,
  updateUserController,
  deleteUserViaRequestController,
  requestUserDeletionController,
  getDeletionRequestsController,
  dashboardController,
  deleteUserDirectController,
  updateSelfController,
  monthlySalaryController,
};

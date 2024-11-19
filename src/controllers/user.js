const {
    getMe,
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    requestUserDeletion,
    getDeletionRequests,
    dashboard,
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
  
  const getAllUsersController = async (req, res) => {
    try {
      const response = await getAllUsers();
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
  
  const deleteUserController = async (req, res) => {
    try {
      const response = await deleteUser(req);
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
      const response = await getDeletionRequests();
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
      const response = await dashboard();
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
    getAllUsersController,
    getUserController,
    createUserController,
    updateUserController,
    deleteUserController,
    requestUserDeletionController,
    getDeletionRequestsController,
    dashboardController,
  };
  
const {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    requestUserDeletion,
    getDeletionRequests,
} = require("../services/user");

const getAllUsersController = async (req, res) => {
    try {
        const response = await getAllUsers(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserController = async (req, res) => {
    try {
        const response = await getUser(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUserController = async (req, res) => {
    try {
        const response = await updateUser(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}   

const deleteUserController = async (req, res) => {
    try {
        const response = await deleteUser(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createUserController = async (req, res) => {
    try {
        const response = await createUser(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const requestUserDeletionController = async (req, res) => {
    try {
        const response = await requestUserDeletion(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDeletionRequestsController = async (req, res) => {
    try {
        const response = await getDeletionRequests(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Controller functions
module.exports = {
  getAllUsersController,
  getUserController,
  createUserController,
  updateUserController,
  deleteUserController,
  requestUserDeletionController,
  getDeletionRequestsController,
};

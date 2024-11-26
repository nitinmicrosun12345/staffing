const {
  createLeave,
  getLeaves,
  getAllLeaves,
  updateLeave,
} = require("../services/leave");

const createLeaveController = async (req, res) => {
  try {
    const response = await createLeave(req, res);
    return res.status(response.status).json({
      message: response.message,
      leave: response.leave || {},
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getLeavesController = async (req, res) => {
    try {
        const response = await getLeaves(req, res);
        return res.status(response.status).json({
        message: response.message,
        leaves: response.leaves || [],
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    }


const updateLeaveController = async (req, res) => {
    try {
        const response = await updateLeave(req, res);
        return res.status(response.status).json({
        message: response.message,
        leave: response.leave || {},
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    }

const getAllLeavesController = async (req, res) => {
    try {
        const response = await getAllLeaves(req, res);
        return res.status(response.status).json({
        message: response.message,
        leaves: response.leaves || [],
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    }
    
module.exports = {
  createLeaveController,
  getLeavesController,
  updateLeaveController,
  getAllLeavesController,
};

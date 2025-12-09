const profileService = require("../services/profileService");

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const profile = await profileService.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const updated = await profileService.updateProfile(userId, req.body);
    res.json(updated);
  } catch (err) {
    if (err.message === 'Current password is incorrect') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

module.exports = { getProfile, updateProfile };

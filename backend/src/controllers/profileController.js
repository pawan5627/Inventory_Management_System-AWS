const profileService = require("../services/profileService");
const { getPresignedPutUrl } = require("../utils/s3");

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

const getAvatarUploadUrl = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { contentType } = req.query;
    if (!contentType) return res.status(400).json({ message: "contentType is required" });

    const key = `avatars/${userId}/${Date.now()}`;
    const url = await getPresignedPutUrl(key, contentType);
    res.json({ uploadUrl: url, key });
  } catch (err) {
    next(err);
  }
};

const setAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { key } = req.body;
    if (!key) return res.status(400).json({ message: "key is required" });

    const bucket = process.env.AVATAR_S3_BUCKET;
    const region = process.env.AWS_REGION || "us-east-1";
    if (!bucket) return res.status(500).json({ message: "AVATAR_S3_BUCKET is not configured" });

    const avatarUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    const updated = await profileService.setAvatarUrl(userId, avatarUrl);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getAvatarUploadUrl, setAvatar };

const User = require("../models/User");
const Group = require("../models/Group");
const bcrypt = require("bcryptjs");

const createUser = async ({ username, email, password, companyId }) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  const hashed = await bcrypt.hash(password, saltRounds);
  const user = await User.create({ username, email, password: hashed, companyId });
  return user;
};

const findByUsername = async (username) => {
  return User.findOne({ username }).populate({
    path: "groups",
    populate: { path: "roles" }
  });
};

const listUsers = async () => User.find().populate({
  path: "groups",
  populate: { path: "roles" }
}).lean();

const addGroupsToUser = async (userId, groupIds) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const groups = await Group.find({ _id: { $in: groupIds } });
  user.groups = Array.from(new Set([...user.groups.map(String), ...groups.map(g => String(g._id))]));
  await user.save();
  return user;
};

module.exports = { createUser, findByUsername, listUsers, addGroupsToUser };

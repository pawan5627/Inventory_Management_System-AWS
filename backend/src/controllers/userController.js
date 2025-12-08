const userService = require("../services/userService");

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ id: user._id, username: user.username, email: user.email });
  } catch (err) { next(err); }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (err) { next(err); }
};

const addGroups = async (req, res, next) => {
  try {
    const user = await userService.addGroupsToUser(req.params.id, req.body.groupIds || []);
    res.json(user);
  } catch (err) { next(err); }
};

module.exports = { createUser, listUsers, addGroups };

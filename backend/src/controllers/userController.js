const userService = require("../services/userService");

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ id: user.id, username: user.username, name: user.name, email: user.email, status: user.status });
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

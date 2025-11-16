const groupService = require("../services/groupService");

const createGroup = async (req, res, next) => {
  try {
    const group = await groupService.createGroup(req.body);
    res.status(201).json(group);
  } catch (err) { next(err); }
};

const listGroups = async (req, res, next) => {
  try {
    const groups = await groupService.listGroups();
    res.json(groups);
  } catch (err) { next(err); }
};

const addRoles = async (req, res, next) => {
  try {
    const group = await groupService.addRolesToGroup(req.params.id, req.body.roleIds || []);
    res.json(group);
  } catch (err) { next(err); }
};

module.exports = { createGroup, listGroups, addRoles };

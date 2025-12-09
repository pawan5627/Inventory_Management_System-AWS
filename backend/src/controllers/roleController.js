const roleService = require("../services/roleService");

const createRole = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json(role);
  } catch (err) { next(err); }
};

const listRoles = async (req, res, next) => {
  try {
    const roles = await roleService.listRoles();
    res.json(roles);
  } catch (err) { next(err); }
};

const updateRole = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await roleService.updateRole(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Role not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

module.exports = { createRole, listRoles, updateRole };


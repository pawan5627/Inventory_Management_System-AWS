const Role = require("../models/Role");

const createRole = async (data) => {
  return Role.create(data);
};

const listRoles = async () => {
  return Role.find().lean();
};

const getRoleById = async (id) => {
  return Role.findById(id);
};

module.exports = { createRole, listRoles, getRoleById };

const Group = require("../models/Group");
const Role = require("../models/Role");

const createGroup = async (data) => {
  return Group.create(data);
};

const listGroups = async () => Group.find().populate("roles").lean();

const addRolesToGroup = async (groupId, roleIds) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");
  // ensure roles exist
  const roles = await Role.find({ _id: { $in: roleIds } });
  group.roles = Array.from(new Set([...group.roles.map(String), ...roles.map(r => String(r._id))]));
  await group.save();
  return group;
};

module.exports = { createGroup, listGroups, addRolesToGroup };

const departmentService = require("../services/departmentService");

const listDepartments = async (req, res) => {
  try {
    const deps = await departmentService.listDepartments();
    res.json(deps);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to list departments' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const created = await departmentService.createDepartment(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create department' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await departmentService.updateDepartment(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Department not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update department' });
  }
};

module.exports = { listDepartments, createDepartment, updateDepartment };

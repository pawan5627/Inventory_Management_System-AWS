const companyService = require('../services/companyService');

const listCompanies = async (req, res) => {
  try {
    const companies = await companyService.listCompanies();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to list companies' });
  }
};

const createCompany = async (req, res) => {
  try {
    const created = await companyService.createCompany(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create company' });
  }
};

const updateCompany = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await companyService.updateCompany(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Company not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update company' });
  }
};

module.exports = { listCompanies, createCompany, updateCompany };

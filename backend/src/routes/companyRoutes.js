const express = require('express');
const router = express.Router();
const { listCompanies, createCompany, updateCompany } = require('../controllers/companyController');
const auth = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/rbacMiddleware');

router.get('/', auth, requireRole('company.read'), listCompanies);
router.post('/', auth, requireRole('company.create'), createCompany);
router.put('/:id', auth, requireRole('company.update'), updateCompany);

module.exports = router;

const express = require('express');
const router = express.Router();
const { listDepartments, createDepartment, updateDepartment } = require('../controllers/departmentController');
const auth = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/rbacMiddleware');

router.get('/', auth, requireRole('department.read'), listDepartments);
router.post('/', auth, requireRole('department.create'), createDepartment);
router.put('/:id', auth, requireRole('department.update'), updateDepartment);

module.exports = router;

const express = require('express');
const { signup, login, getUser, borrowMoney } = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/user', auth, getUser);
router.post('/borrow', auth, borrowMoney);

module.exports = router;

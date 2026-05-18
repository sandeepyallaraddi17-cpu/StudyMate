const express = require('express');
const router = express.Router();
const { askQuestion, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, askQuestion);
router.get('/:documentId', protect, getChatHistory);

module.exports = router;

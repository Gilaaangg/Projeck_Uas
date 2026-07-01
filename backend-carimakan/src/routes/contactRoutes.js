const express = require('express');
const { submitContactMessage, getAllContacts, replyContact, deleteContact } = require('../controllers/contactController');
const authenticate = require('../middlewares/auth');
const admin = require('../middlewares/admin');

const router = express.Router();

// Public
router.post('/', submitContactMessage);

// Admin only
router.get('/', authenticate, admin, getAllContacts);
router.patch('/:id', authenticate, admin, replyContact);
router.delete('/:id', authenticate, admin, deleteContact);

module.exports = router;

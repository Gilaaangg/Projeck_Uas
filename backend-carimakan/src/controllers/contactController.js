const { Contact } = require('../models');

// @desc    Submit a contact message
// @route   POST /api/contacts
// @access  Public
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required',
      });
    }

    const newContact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Pesan berhasil dikirim! Kami akan segera menghubungi Anda.',
      data: newContact,
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Gagal mengirim pesan',
    });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contacts
// @access  Admin
const getAllContacts = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status && status !== 'all' ? { status } : {};

    const contacts = await Contact.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data pengaduan' });
  }
};

// @desc    Reply to a contact message & update status (Admin)
// @route   PATCH /api/contacts/:id
// @access  Admin
const replyContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Pengaduan tidak ditemukan' });
    }

    const { status, adminReply } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (adminReply !== undefined) updateData.adminReply = adminReply;

    await contact.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Pengaduan berhasil diperbarui',
      data: contact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengaduan' });
  }
};

// @desc    Delete a contact message (Admin)
// @route   DELETE /api/contacts/:id
// @access  Admin
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Pengaduan tidak ditemukan' });
    }

    await contact.destroy();

    res.status(200).json({
      success: true,
      message: 'Pengaduan berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus pengaduan' });
  }
};

module.exports = {
  submitContactMessage,
  getAllContacts,
  replyContact,
  deleteContact,
};

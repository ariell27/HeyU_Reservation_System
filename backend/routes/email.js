import express from 'express';
import { sendConfirmationEmail } from '../utils/emailUtils.js';
import { readBookings } from '../utils/bookingUtils.js';

const router = express.Router();

// POST /api/email/send-confirmation - Send confirmation email manually
router.post('/send-confirmation', async (req, res) => {
  try {
    const { bookingId, bookingData } = req.body;

    let booking = bookingData;

    // If bookingId is provided, fetch booking from database
    if (bookingId && !bookingData) {
      const bookings = await readBookings();
      booking = bookings.find(b => b.bookingId === bookingId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
    }

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'Booking data or bookingId is required'
      });
    }

    // Send email
    const result = await sendConfirmationEmail(booking);

    if (result.success) {
      res.json({
        success: true,
        message: 'Confirmation email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error || result.message
      });
    }
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    res.status(500).json({
      success: false,
      message: 'Server error, unable to send email',
      error: error.message
    });
  }
});

export default router;


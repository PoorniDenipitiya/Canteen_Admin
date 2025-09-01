
const express = require('express');
const router = express.Router();
const Complaint = require('../Models/ComplaintModel');
const AdminUser = require('../Models/UserModel');
const User = require('../Models/UsersModel');
const nodemailer = require('nodemailer');

// GET complaints by canteen name for dashboard
router.get('/canteen/:canteenName', async (req, res) => {
  const { canteenName } = req.params;
  
  try {
    const complaints = await Complaint.find({ canteenName: decodeURIComponent(canteenName) })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints", details: err.message });
  }
});

// Update complaint status and send email to user

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    console.log(`[Complaint] Updating status for complaintId: ${req.params.id} to: ${status}`);
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!complaint) {
      console.error(`[Complaint] Complaint not found for id: ${req.params.id}`);
      return res.status(404).json({ error: 'Complaint not found' });
    }


    // Email logic for status changes
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Helper: complaint details string
    let complaintDetails = `Order ID: ${complaint.orderId}\nCanteen Name: ${complaint.canteenName}\nOrdered Date: ${complaint.orderedDate}\nPrice: ${complaint.price}\nPayment Mode: ${complaint.paymentMode}\nComplaint Type: ${complaint.complaintType}\nTitle: ${complaint.title}\nDescription: ${complaint.description}\nStatus: ${complaint.status}`;
    // Add action field for specific statuses
    const statusRequiresAction = ["MO Investigation Completed", "Investigation Completed", "Complaint Closed"].includes(status);
    if (statusRequiresAction) {
      complaintDetails += `\nAction: ${complaint.action || "-----"}`;
    }

    if (status === 'On MO Investigation') {
      // Find Medical Officer user from adminusers
      const moUser = await AdminUser.findOne({ role: 'Medical Officer' });
      if (moUser && moUser.email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: moUser.email,
          subject: 'New Complaint Received for Medical Officer',
          text: `Dear Medical Officer,\n\nA new complaint has been assigned to you.\n\n${complaintDetails}\n\nPlease review and take necessary action.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`[Complaint] Error sending email to Medical Officer:`, error);
          } else {
            console.log(`[Complaint] Email sent to Medical Officer:`, info.response);
          }
        });
      } else {
        console.warn(`[Complaint] No Medical Officer user found or missing email.`);
      }
    }

    if (status === 'MO Investigation Completed') {
      // Send email to cateenz.uom@gmail.com
      // Only send email if action is selected
      if (complaint.action && complaint.action !== "-----") {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: 'cateenz.uom@gmail.com',
          subject: 'Complaint Status Updated by Medical Officer',
          text: `Dear Admin,\n\nA complaint has been updated to 'MO Investigation Completed'.\n\n${complaintDetails}\n\nPlease review and take further action.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`[Complaint] Error sending email to Admin:`, error);
          } else {
            console.log(`[Complaint] Email sent to Admin:`, info.response);
          }
        });
      } else {
        console.log(`[Complaint] Email not sent for status '${status}' because action is not selected.`);
      }
    }

    // Existing: notify user who submitted complaint (from users collection)
    const user = await User.findById(complaint.userId);
    if (user && user.email) {
  // Send refund email to canteen owner if action is 'Refund' and status is one of the three
      if (statusRequiresAction && complaint.action === "Refund") {
        // Find canteen owner by canteen name
        const canteenOwner = await AdminUser.findOne({ canteenName: complaint.canteenName });
        if (canteenOwner && canteenOwner.email) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: canteenOwner.email,
            subject: 'Refund Required for Complaint',
            text:
              `Dear Canteen Owner,\n\nA complaint for your canteen requires a refund.\n\n${complaintDetails}\n\n**Note: Within 3 days you have to refund the order payment again to the Admin.**`
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(`[Complaint] Error sending refund email to canteen owner:`, error);
            } else {
              console.log(`[Complaint] Refund email sent to canteen owner:`, info.response);
            }
          });
        } else {
          console.warn(`[Complaint] No canteen owner found or missing email for canteen: ${complaint.canteenName}`);
        }
      }
      // Only send email for these statuses if action is selected
      if (!statusRequiresAction || (complaint.action && complaint.action !== "-----")) {
        let note = "";
        if (statusRequiresAction && complaint.action === "Refund") {
          note = "\n\n**Note: Within one week (After 3 days) you can collect your order payment from admin.**";
        }
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Your complaint status has been updated',
          text:
            `Hello ${user.username || user.name || 'User'},\n\nYour complaint for Order ID: ${complaint.orderId} has been updated.\nCurrent status: ${complaint.status}` +
            (statusRequiresAction ? `\nAction: ${complaint.action || "-----"}` : "") +
            `\n\n${complaintDetails}${note}\n\nThank you.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`[Complaint] Error sending email to ${user.email}:`, error);
          } else {
            console.log(`[Complaint] Email sent successfully to: ${user.email}`, info.response);
          }
        });
      } else {
        console.log(`[Complaint] Email not sent to user for status '${status}' because action is not selected.`);
      }
    } else {
      console.warn(`[Complaint] User not found or missing email for userId: ${complaint.userId}`);
    }

    res.json(complaint);
  } catch (err) {
    console.error('[Complaint] Error in status update route:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update complaint action
router.put('/:id/action', async (req, res) => {
  try {
    const { action } = req.body;
    console.log(`[Complaint] Updating action for complaintId: ${req.params.id} to: ${action}`);
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { action },
      { new: true }
    );
    if (!complaint) {
      console.error(`[Complaint] Complaint not found for id: ${req.params.id}`);
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (err) {
    console.error('[Complaint] Error in action update route:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

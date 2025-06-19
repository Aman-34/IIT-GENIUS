require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// In-memory storage for verification data (use a database in production)
const verifications = {};

// Generate random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP API
app.post('/api/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        
        // Generate OTP
        const otp = generateOTP();
        const verificationId = `verif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Store verification data
        verifications[verificationId] = {
            phone,
            otp,
            attempts: 0,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiration
        };
        
        // Send OTP via Twilio
        try {
            await twilioClient.messages.create({
                body: `Your IIT Genius verification code is: ${otp}`,
                from: twilioPhoneNumber,
                to: phone
            });
            
            return res.status(200).json({ 
                message: 'OTP sent successfully',
                verificationId 
            });
        } catch (twilioError) {
            console.error('Twilio error:', twilioError);
            delete verifications[verificationId];
            return res.status(500).json({ message: 'Failed to send OTP' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Verify OTP API
app.post('/api/verify-otp', (req, res) => {
    try {
        const { verificationId, otp, phone } = req.body;
        
        if (!verificationId || !otp || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const verification = verifications[verificationId];
        
        // Check if verification exists
        if (!verification) {
            return res.status(404).json({ message: 'Invalid verification ID' });
        }
        
        // Check if phone matches
        if (verification.phone !== phone) {
            return res.status(400).json({ message: 'Phone number mismatch' });
        }
        
        // Check if OTP is expired
        if (new Date() > verification.expiresAt) {
            delete verifications[verificationId];
            return res.status(400).json({ message: 'OTP has expired' });
        }
        
        // Check OTP attempts
        if (verification.attempts >= 3) {
            delete verifications[verificationId];
            return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
        }
        
        // Increment attempts
        verification.attempts++;
        
        // Verify OTP
        if (verification.otp === otp) {
            // In production, you would:
            // 1. Create/update user record in database
            // 2. Generate authentication token
            // 3. Return user data/token
            
            // Clean up
            delete verifications[verificationId];
            
            return res.status(200).json({ 
                message: 'OTP verified successfully',
                verified: true
            });
        } else {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Resend OTP API
app.post('/api/resend-otp', async (req, res) => {
    try {
        const { verificationId, phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        
        // If verificationId is provided, check if it exists
        if (verificationId && verifications[verificationId]) {
            delete verifications[verificationId];
        }
        
        // Generate new OTP
        const newOtp = generateOTP();
        const newVerificationId = `verif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Store verification data
        verifications[newVerificationId] = {
            phone,
            otp: newOtp,
            attempts: 0,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiration
        };
        
        // Send OTP via Twilio
        try {
            await twilioClient.messages.create({
                body: `Your new IIT Genius verification code is: ${newOtp}`,
                from: twilioPhoneNumber,
                to: phone
            });
            
            return res.status(200).json({ 
                message: 'OTP resent successfully',
                verificationId: newVerificationId
            });
        } catch (twilioError) {
            console.error('Twilio error:', twilioError);
            delete verifications[newVerificationId];
            return res.status(500).json({ message: 'Failed to resend OTP' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
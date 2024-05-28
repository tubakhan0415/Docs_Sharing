const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;
const SECRET_KEY = process.env.SECRET_KEY;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.includes('application/pdf') || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only .pdf, .jpg, .jpeg, .xlsx and .png files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).fields([
    { name: '3months_salary', maxCount: 10 },
    { name: 'bank_statement_6mo', maxCount: 10 },
    { name: 'form16_1yr', maxCount: 10 },
    { name: 'company_id', maxCount: 10 },
    { name: 'photo', maxCount: 10 },
    { name: 'degree_certificate', maxCount: 10 },
    { name: 'registration_certificate', maxCount: 10 },
    { name: 'address_proof', maxCount: 10 },
    { name: 'live_photo', maxCount: 10 },
    { name: 'itr_2yrs', maxCount: 10 },
    { name: 'form_26as_2yrs', maxCount: 10 },
    { name: 'bank_statement_1yr', maxCount: 10 },
    { name: 'pan_card', maxCount: 10 },
    { name: 'aadhaar_card', maxCount: 10 },
    { name: 'company_address_proof', maxCount: 10 },
    { name: 'gst_certificate', maxCount: 10 },
    { name: 'gst_return_6mo', maxCount: 10 },
    { name: 'partnership_deed', maxCount: 10 },
    { name: 'moa_aoa_coi', maxCount: 10 },
    { name: 'board_resolution', maxCount: 10 },
    { name: 'partner1_pan_card', maxCount: 1 },
    { name: 'partner1_aadhaar_card', maxCount: 1 },
    { name: 'partner2_pan_card', maxCount: 1 },
    { name: 'partner2_aadhaar_card', maxCount: 1 },
    { name: 'partner3_pan_card', maxCount: 1 },
    { name: 'partner3_aadhaar_card', maxCount: 1 }
]);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Database connection error:', err));

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', UserSchema);

const ApplicantSchema = new mongoose.Schema({
    employmentType: String,
    name: String,
    documents: {
        '3months_salary': [String],
        'bank_statement_6mo': [String],
        'form16_1yr': [String],
        'company_id': [String],
        'photo': [String],
        'degree_certificate': [String],
        'registration_certificate': [String],
        'address_proof': [String],
        'live_photo': [String],
        'itr_2yrs': [String],
        'form_26as_2yrs': [String],
        'bank_statement_1yr': [String],
        'pan_card': [String],
        'aadhaar_card': [String],
        'company_address_proof': [String],
        'gst_certificate': [String],
        'gst_return_6mo': [String],
        'partnership_deed': [String],
        'moa_aoa_coi': [String],
        'board_resolution': [String],
        'partner1_pan_card': String,
        'partner1_aadhaar_card': String,
        'partner2_pan_card': String,
        'partner2_aadhaar_card': String,
        'partner3_pan_card': String,
        'partner3_aadhaar_card': String
    },
    mothersName: String,
    email: String,
    workingAddress: String,
    phoneNumber: String,
    whatsappNumber: String,
    permanentAddress: String,
    currentAddress: String,
    businessType: String,
    panCardNumber: { type: String, unique: true },
    doctorType: String
});

const Applicant = mongoose.model('Applicant', ApplicantSchema);

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Hardcoded credentials
    const predefinedUsername = 'F2ops';
    const predefinedPassword = 'Freedom@2030';

    if (username === predefinedUsername && password === predefinedPassword) {
        const token = jwt.sign({ id: username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/submit-documents', upload, async (req, res) => {
    try {
        const documents = {};
        let hasDocuments = false;

        for (let key in req.files) {
            documents[key] = req.files[key].map(file => file.path.replace(/\\/g, '/')); // Normalize backslashes
            if (documents[key].length > 0) {
                hasDocuments = true;
            }
        }

        if (!hasDocuments) {
            return res.status(400).json({ message: 'Please upload at least one document.' });
        }

        const applicantData = {
            employmentType: req.body.profession,
            name: req.body.name,
            documents: documents,
            mothersName: req.body.mothers_name,
            email: req.body.email,
            workingAddress: req.body.working_address,
            phoneNumber: req.body.phone_number,
            whatsappNumber: req.body.whatsapp_number,
            permanentAddress: req.body.permanent_address,
            currentAddress: req.body.current_address,
            businessType: req.body.business_type,
            panCardNumber: req.body.pan_card_number,
            doctorType: req.body.doctor_type
        };

        // Update existing applicant or create a new one if not found
        const applicant = await Applicant.findOneAndUpdate(
            { panCardNumber: req.body.pan_card_number },
            applicantData,
            { new: true, upsert: true } // Create a new document if not found
        );

        res.json({ message: 'Documents successfully submitted!' });
    } catch (err) {
        console.error('Error when processing documents:', err);
        res.status(500).json({ message: 'Error processing your request', error: err.toString() });
    }
});

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }
        req.userId = decoded.id;
        next();
    });
};

app.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const { filter } = req.query; // Get the filter from query parameters
        const applicants = await Applicant.find({ employmentType: filter }); // Find applicants based on the filter

        const formattedData = applicants.map(applicant => ({
            employmentType: applicant.employmentType,
            'PAN_no': applicant.panCardNumber,
            '3 months salary slip': applicant.documents['3months_salary'],
            '6 months bank statement': applicant.documents['bank_statement_6mo'],
            'Last 1 year bank statement': applicant.documents['bank_statement_1yr'],
            'Form 16': applicant.documents['form16_1yr'],
            'Last 2 years financials': applicant.documents['itr_2yrs'],
            'Last 2 years Form 26AS': applicant.documents['form_26as_2yrs'],
            'ID card': applicant.documents['company_id'],
            'PAN card': applicant.documents['pan_card'],
            'PAN card number': applicant.panCardNumber,
            'Adhaar card': applicant.documents['aadhaar_card'],
            'Adhaar card number': applicant.documents['aadhaar_card'],
            'Ownership proof': applicant.documents['company_address_proof'],
            'GST registration/Business proof': applicant.documents['gst_certificate'],
            'GST Return (Last 6 months)': applicant.documents['gst_return_6mo'],
            'Partnership deed': applicant.documents['partnership_deed'],
            'MOA/AOA/COI': applicant.documents['moa_aoa_coi'],
            'Board resolution': applicant.documents['board_resolution'],
            'High degree certificate': applicant.documents['degree_certificate'],
            'Registration certificate': applicant.documents['registration_certificate'],
            'Photo': applicant.documents['photo'],
            'Mother\'s name': applicant.mothersName,
            'Email': applicant.email,
            'Working address': applicant.workingAddress,
            'Phone number': applicant.phoneNumber,
            'WhatsApp number': applicant.whatsappNumber,
            'Permanent address': applicant.permanentAddress,
            'Current address proof': applicant.documents['address_proof'],
            'Partner 1 PAN Card': applicant.documents['partner1_pan_card'],
            'Partner 1 Aadhaar Card': applicant.documents['partner1_aadhaar_card'],
            'Partner 2 PAN Card': applicant.documents['partner2_pan_card'],
            'Partner 2 Aadhaar Card': applicant.documents['partner2_aadhaar_card'],
            'Partner 3 PAN Card': applicant.documents['partner3_pan_card'],
            'Partner 3 Aadhaar Card': applicant.documents['partner3_aadhaar_card']
        }));
        res.json({ data: formattedData });
    } catch (err) {
        console.error('Error fetching applicants:', err);
        res.status(500).json({ message: 'Error fetching data', error: err.toString() });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

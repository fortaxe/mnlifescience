import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import MR from '../models/MR.js';

// Admin Signin
export const adminSignin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await MR.findOne({ email, role: 'admin' });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);
        res.send({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// MR (User) Signin
export const mrSignin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const mr = await MR.findOne({ email, role: 'mr' });

        if (!mr || !(await bcrypt.compare(password, mr.password))) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: mr._id, role: 'mr' }, process.env.JWT_SECRET);
        res.send({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin creates MR
export const createMR = async (req, res) => {
    try {
        const { name, email, password, area, code } = req.body;

        const existingMR = await MR.findOne({ email });
        if (existingMR) {
            return res.status(400).send('An MR with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newMR = new MR({ name, email, password: hashedPassword, area, code, role: 'mr' });

        await newMR.save();
        res.status(201).send('MR created successfully');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
  
/// Admin creation route (only used once)
export const createAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingAdmin = await MR.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin account already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new MR({ email, password: hashedPassword, role: 'admin' });

        await admin.save();
        res.status(201).json('Admin created successfully');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
  

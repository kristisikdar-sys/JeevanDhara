import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const registerSchema = Joi.object({
	email: Joi.string().email().required(),
	phone: Joi.string().min(8).max(20).required(),
	password: Joi.string().min(6).required(),
	role: Joi.string().valid('donor', 'recipient', 'admin').default('donor'),
	consent: Joi.boolean().required()
});

const loginSchema = Joi.object({
	identifier: Joi.string().required(), // email or phone
	password: Joi.string().required()
});

function signTokens(user) {
	const payload = { sub: user._id.toString(), role: user.role, email: user.email };
	const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', {
		expiresIn: process.env.JWT_EXPIRES_IN || '1h'
	});
	const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'dev_refresh', {
		expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
	});
	return { accessToken, refreshToken };
}

export async function register(req, res) {
	const { error, value } = registerSchema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const { email, phone, password, role, consent } = value;
	const existing = await User.findOne({ $or: [{ email }, { phone }] });
	if (existing) return res.status(409).json({ message: 'User already exists' });
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await User.create({
		email,
		phone,
		passwordHash,
		role,
		consent: { recorded: !!consent, recordedAt: consent ? new Date() : undefined }
	});
	const tokens = signTokens(user);
	user.refreshTokens.push({ token: tokens.refreshToken });
	await user.save();
	return res.status(201).json({ user: { id: user._id, email, phone, role }, ...tokens });
}

export async function login(req, res) {
	const { error, value } = loginSchema.validate(req.body);
	if (error) return res.status(400).json({ message: error.message });
	const { identifier, password } = value;
	const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
	const tokens = signTokens(user);
	user.refreshTokens.push({ token: tokens.refreshToken });
	await user.save();
	return res.json({ user: { id: user._id, email: user.email, phone: user.phone, role: user.role }, ...tokens });
}
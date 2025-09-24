const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // For demo purposes, accept admin/admin and user/user
        if ((username === 'admin' && password === 'admin') || 
            (username === 'user' && password === 'user')) {
            
            const token = jwt.sign(
                { 
                    userId: username === 'admin' ? 1 : 2,
                    username: username,
                    isAdmin: username === 'admin'
                },
                process.env.JWT_SECRET || 'radio-pwa-secret',
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    id: username === 'admin' ? 1 : 2,
                    username: username,
                    name: username === 'admin' ? 'Administrador' : 'Usuario',
                    isAdmin: username === 'admin'
                },
                expiresIn: 86400
            });
        }

        res.status(401).json({
            success: false,
            message: 'Credenciales inválidas'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });
    }
});

// Validate token
router.get('/validate', (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ valid: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'radio-pwa-secret');
        res.json({
            valid: true,
            user: {
                id: decoded.userId,
                username: decoded.username,
                name: decoded.username === 'admin' ? 'Administrador' : 'Usuario',
                isAdmin: decoded.isAdmin
            }
        });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Sesión cerrada exitosamente' 
    });
});

module.exports = router;
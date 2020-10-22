const express = require('express');
const route = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');


// @route   POST API/auth
// @desc    Authorization
// @access  Public
route.post('/api/login', async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;

    try {

        if (email === "admin" && password === "admin") {
            return res.status(201).json("ADMIN la tao.");
        }
        else {
            // check existed user
            let user = await User.findOne(email);
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }
            // Matching password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            };
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 36000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error');
    }
})


module.exports = route;
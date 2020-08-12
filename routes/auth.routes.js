const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()


// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Wrong email').isEmail(),
        check('password', 'Min 6 symbols')
            .isLength({ min: 6})
    ],
    async (request, response) => {
    try {
        // console.log('Body', request.body)

        const errors = validationResult(request)

        if (!errors.isEmpty()) {
            return response.status(400).json({
                errors: errors.array(),
                message: 'Wrong registration data'
            })
        }

        const {email, password} = request.body
        const candidate = await User.findOne({email})
        if (candidate) {
            return response.status(400).json({ message: 'User already exists'})
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({email, password: hashedPassword})
        await user.save()
        response.status(201).json({ message: 'User created'})
    } catch (e) {
        response.status(500).json({ message: 'Something went wrong, try again'})
    }
})

// /api/auth/login
router.post('/login',
    [
        check('email', 'Wrong email')
            .normalizeEmail().isEmail(),
        check('password', 'Enter password')
            .exists()
    ],
    async (request, response) => {
    try {
        const errors = validationResult(request)

        if (!errors.isEmpty()) {
            return response.status(400).json({
                errors: errors.array(),
                message: 'Wrong enter data'
            })
        }
        //console.log('Body', request.body)
        const {email, password} = request.body
        const user = await User.findOne({email})


        if (!user) {
            return response.status(400).json({ message: 'User is not found'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            response.status(400).json({ message: 'Wrong password, try again'})
        }
        console.log('User', user)
        const token = jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            { expiresIn: '1h'}
        )
        response.json({token, userId: user.id})
    } catch (e) {
        response.status(500).json({ message: 'Something went wrong, try again'})
    }
})

module.exports = router
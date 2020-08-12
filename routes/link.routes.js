const {Router} = require('express')
const config = require('config')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const Link = require('../models/Link')
const auth = require('../middleware/auth.middleware')
const shortid = require('shortid')

const router = Router()

router.post('/generate', auth, async (request, response) => {
    try {
        const baseUrl = config.get('baseUrl')
        const {from} = request.body
        const code = shortid.generate()

        const existing = await Link.findOne({from})

        if (existing) {
            return response.json({ link: existing})
        }

        const to = baseUrl + '/t/' + code
        const link = new Link({
            from, to, code, owner: request.user.userId
        })

        await link.save()

        return response.status(201).json({ link: link})
    } catch (e) {
        response.status(500).json({ message: 'Something went wrong, try again'})
    }
})

router.get('/', auth, async (request, response) => {
    try {
        const links = await Link.find({owner: request.user.userId})
        response.json(links)
    } catch (e) {
        response.status(500).json({ message: 'Something went wrong, try again'})
    }
})

router.get('/:id', auth, async (request, response) => {
    try {
        const links = await Link.findById(request.params.id)
        response.json(links)
    } catch (e) {
        response.status(500).json({ message: 'Something went wrong, try again'})
    }
})

module.exports = router
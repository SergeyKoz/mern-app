const {Router} = require('express')
const Link = require('../models/Link')
const router = Router()

router.get('/:id', async (request, response) => {
    try {
        const link = await Link.findOne({code: request.params.id})
        console.log(link)
        if (link) {
            link.clicks++;
            await link.save()
            return response.redirect(link.from)
        }

        response.status(404).json({ message: 'Link is not found'})
    } catch (e) {
        response.status(500).json({ message: 'Something went wrong, try again'})
    }
})

module.exports = router
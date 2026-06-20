const express = require('express')
const router = express.Router()
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware')
const controller = require('../controllers/notificationController')

console.log("=== DIAGNOSTIC CHECK ===")
console.log("Available functions:", Object.keys(controller))
console.log("Is update loaded?", typeof controller.updateNotification === 'function')
console.log("========================")

router.get('/my', authMiddleware, controller.getMyNotifications)
router.delete('/my/all', authMiddleware, controller.clearMyNotifications)
router.get('/:id', authMiddleware, controller.getNotificationById)
router.put('/:id/read', authMiddleware, controller.markAsRead)
router.delete('/:id', authMiddleware, controller.deleteNotification)

router.put('/:id', authMiddleware, (req, res, next) => {
    if (!controller.updateNotification) {
        return res.status(500).json({ message: "Update function missing" })
    }
    return controller.updateNotification(req, res, next)
})

router.get('/', authMiddleware, isAdmin, controller.getAllNotifications)
router.post('/', authMiddleware, controller.sendNotification)

module.exports = router
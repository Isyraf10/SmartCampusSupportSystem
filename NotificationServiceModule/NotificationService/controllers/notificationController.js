const Notification = require('../models/Notification')
const { catchAsync, AppError } = require('../utils/errorHandler')
const { RESPONSE_CONTRACT, API_CONTRACTS } = require('../constants/apiConstants')

const getMyNotifications = catchAsync(async (req, res) => {
    const userId = req.user?.userId || req.user?.id
    const userEmail = req.user?.userEmail || req.user?.email
    const rawRole = String(req.user?.role || req.user?.userRole || 'STUDENT').toUpperCase()

    const audienceTags = ['ALL']
    if (rawRole === 'ADMIN') {
        audienceTags.push('ADMIN')
    } else if (rawRole === 'STAFF') {
        audienceTags.push('STAFF', 'STUDENT_STAFF')
    } else if (rawRole === 'LECTURER') {
        audienceTags.push('STAFF', 'LECTURER', 'LECTURER_STUDENT', 'STUDENT_STAFF')
    } else {
        audienceTags.push('STUDENT', 'STUDENT_STAFF', 'LECTURER_STUDENT')
    }

    const notifs = await Notification.find({
        $or: [
            { userId: userId },
            { userEmail: userEmail },
            { targetAudience: { $in: audienceTags } }
        ]
    }).sort({ createdAt: -1 })

    res.json(RESPONSE_CONTRACT.SUCCESS(notifs, `Found ${notifs.length} notifications`))
})

const getAllNotifications = catchAsync(async (req, res) => {
    const notifs = await Notification.find().sort({ createdAt: -1 })
    res.json(RESPONSE_CONTRACT.SUCCESS(notifs, `Found ${notifs.length} notifications`))
})

const getNotificationById = catchAsync(async (req, res, next) => {
    const notif = await Notification.findById(req.params.id)
    if (!notif) return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.NOT_FOUND, 404))
    res.json(RESPONSE_CONTRACT.SUCCESS(notif))
})

const markAsRead = catchAsync(async (req, res, next) => {
    const notif = await Notification.findById(req.params.id)
    if (!notif) return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.NOT_FOUND, 404))

    const userId = req.user?.userId || req.user?.id
    const userEmail = req.user?.userEmail || req.user?.email

    if (notif.targetAudience === 'INDIVIDUAL' && notif.userId !== userId && notif.userEmail !== userEmail) {
        return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.FORBIDDEN, 403))
    }

    notif.isRead = true
    await notif.save()
    res.json(RESPONSE_CONTRACT.SUCCESS(notif, API_CONTRACTS.SUCCESS_MESSAGES.MARKED_AS_READ))
})

const sendNotification = catchAsync(async (req, res, next) => {
    const { recipientId, type, message, metadata } = req.body
    const targetAudience = req.body.targetAudience || 'INDIVIDUAL'

    if (!type || !message) {
        return next(new AppError('Type and message are required', 400))
    }

    if (targetAudience === 'INDIVIDUAL' && !recipientId) {
        return next(new AppError('Recipient Email or ID is required', 400))
    }

    let userId = null
    let userEmail = null

    if (targetAudience === 'INDIVIDUAL') {
        if (recipientId.includes('@')) {
            userEmail = recipientId
        } else {
            userId = recipientId
        }
    }

    const notif = await Notification.create({
        userId,
        userEmail,
        targetAudience,
        type,
        message,
        metadata: metadata || {}
    })

    res.status(201).json(RESPONSE_CONTRACT.CREATED(notif, API_CONTRACTS.SUCCESS_MESSAGES.NOTIFICATION_SENT))
})

const updateNotification = catchAsync(async (req, res, next) => {
    const { recipientId, targetAudience } = req.body
    let updateData = { ...req.body }

    if (targetAudience === 'INDIVIDUAL' && recipientId) {
        if (recipientId.includes('@')) {
            updateData.userEmail = recipientId
            updateData.userId = null
        } else {
            updateData.userId = recipientId
            updateData.userEmail = null
        }
    } else if (targetAudience !== 'INDIVIDUAL') {
        updateData.userId = null
        updateData.userEmail = null
    }

    const notif = await Notification.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!notif) return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.NOT_FOUND, 404))
    res.json(RESPONSE_CONTRACT.SUCCESS(notif, 'Notification updated successfully'))
})

const deleteNotification = catchAsync(async (req, res, next) => {
    const notif = await Notification.findByIdAndDelete(req.params.id)
    if (!notif) return next(new AppError(API_CONTRACTS.ERROR_MESSAGES.NOT_FOUND, 404))
    res.json(RESPONSE_CONTRACT.SUCCESS(null, API_CONTRACTS.SUCCESS_MESSAGES.NOTIFICATION_DELETED))
})

const clearMyNotifications = catchAsync(async (req, res) => {
    const userId = req.user?.userId || req.user?.id
    const userEmail = req.user?.userEmail || req.user?.email
    await Notification.deleteMany({ $or: [{ userId }, { userEmail }] })
    res.json(RESPONSE_CONTRACT.SUCCESS(null, API_CONTRACTS.SUCCESS_MESSAGES.CLEARED))
})

module.exports = {
    getMyNotifications,
    getAllNotifications,
    getNotificationById,
    markAsRead,
    sendNotification,
    updateNotification,
    deleteNotification,
    clearMyNotifications
}
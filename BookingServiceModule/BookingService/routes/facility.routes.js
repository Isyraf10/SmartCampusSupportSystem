/**
 * facility.routes.js
 *
 * GET  /api/v1/facilities              — list all (PUBLIC)
 * GET  /api/v1/facilities/:id          — get one (PUBLIC)
 * GET  /api/v1/facilities/:id/availability — check slot (PUBLIC)
 * POST /api/v1/facilities              — create (admin only)
 * PUT  /api/v1/facilities/:id          — update (admin only)
 * DELETE /api/v1/facilities/:id        — delete (admin only)
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/facility.controller');

// PUBLIC routes — NO authentication required
router.get('/', controller.list);
router.get('/:id/availability', controller.availability);
router.get('/:id', controller.getOne);

// PROTECTED routes — authentication required (admin only)
router.use(auth);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

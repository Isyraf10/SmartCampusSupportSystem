const facilityService = require('./facility.service');

function requireAdmin(req, res) {
    if (req.user?.userRole?.toLowerCase() !== 'admin') {
        res.status(403).json({ message: 'Admin only' });
        return false;
    }
    return true;
}

async function list(req, res) {
    try {
        const facilities = await facilityService.listFacilities();
        res.json(facilities);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch facilities' });
    }
}

async function getOne(req, res) {
    try {
        const facility = await facilityService.getFacilityById(req.params.id);
        if (!facility) return res.status(404).json({ message: 'Facility not found' });
        res.json(facilityService.formatFacility(facility));
    } catch (err) {
        res.status(404).json({ message: 'Facility not found' });
    }
}

async function availability(req, res) {
    try {
        const result = await facilityService.checkAvailability(req.params.id, req.query);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Availability check failed' });
    }
}

async function create(req, res) {
    if (!requireAdmin(req, res)) return;

    try {
        const facility = await facilityService.createFacility(req.body);
        res.status(201).json(facility);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Failed to create facility' });
    }
}

async function update(req, res) {
    if (!requireAdmin(req, res)) return;

    try {
        const facility = await facilityService.updateFacility(req.params.id, req.body);
        res.json(facility);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Failed to update facility' });
    }
}

async function remove(req, res) {
    if (!requireAdmin(req, res)) return;

    try {
        const result = await facilityService.deleteFacility(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Failed to delete facility' });
    }
}

module.exports = { list, getOne, availability, create, update, remove };

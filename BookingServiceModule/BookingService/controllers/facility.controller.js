const facilityService = require('../services/facility.service');
const catchAsync = require('../utils/catchAsync');

function requireAdmin(req, res) {
    if (req.user?.userRole?.toLowerCase() !== 'admin') {
        res.status(403).json({ message: 'Admin only' });
        return false;
    }
    return true;
}

const list = catchAsync(async (req, res) => {
    const facilities = await facilityService.listFacilities();
    res.json(facilities);
});

const getOne = catchAsync(async (req, res) => {
    const facility = await facilityService.getFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json(facility);
});

const availability = catchAsync(async (req, res) => {
    const result = await facilityService.checkAvailability(req.params.id, req.query);
    res.json(result);
});

const create = catchAsync(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const facility = await facilityService.createFacility(req.body);
    res.status(201).json(facility);
});

const update = catchAsync(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const facility = await facilityService.updateFacility(req.params.id, req.body);
    res.json(facility);
});

const remove = catchAsync(async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const result = await facilityService.deleteFacility(req.params.id);
    res.json(result);
});

module.exports = { list, getOne, availability, create, update, remove };
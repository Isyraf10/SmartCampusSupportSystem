// utils/catchAsync.js
module.exports = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
        console.error(err.message);
        res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
    });
};
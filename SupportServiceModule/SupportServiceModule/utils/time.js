const formatAcademicTime = (date) => {
    return new Date(date).toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
};

const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    res.status(500).json({
        message: "Internal Server Error",
        error: err.message
    });
};

module.exports = { formatAcademicTime, errorHandler };
const { body, param, query, validationResult } = require('express-validator');
const constants = require('../config/constants');

const commonValidators = {
    email: body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        .isLength({ max: constants.VALIDATION.EMAIL_MAX_LENGTH })
        .withMessage(`Email must be less than ${constants.VALIDATION.EMAIL_MAX_LENGTH} characters`),
    
    password: body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: constants.VALIDATION.PASSWORD_MIN_LENGTH })
        .withMessage(`Password must be at least ${constants.VALIDATION.PASSWORD_MIN_LENGTH} characters`),
    
    fullName: body('full_name')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ max: constants.VALIDATION.NAME_MAX_LENGTH })
        .withMessage(`Full name must be less than ${constants.VALIDATION.NAME_MAX_LENGTH} characters`),
    
    phone: body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .isMobilePhone().withMessage('Invalid phone number')
        .isLength({ max: constants.VALIDATION.PHONE_MAX_LENGTH })
        .withMessage(`Phone number must be less than ${constants.VALIDATION.PHONE_MAX_LENGTH} characters`),
    
    notes: body('notes')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: constants.VALIDATION.NOTES_MAX_LENGTH })
        .withMessage(`Notes must be less than ${constants.VALIDATION.NOTES_MAX_LENGTH} characters`),
    
    date: body('booking_date')
        .notEmpty().withMessage('Date is required')
        .isDate().withMessage('Invalid date format')
        .custom(value => {
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (date < today) {
                throw new Error('Date cannot be in the past');
            }
            
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + constants.MAX_ADVANCE_BOOKING_DAYS);
            
            if (date > maxDate) {
                throw new Error(`Booking cannot be more than ${constants.MAX_ADVANCE_BOOKING_DAYS} days in advance`);
            }
            
            return true;
        }),
    
    time: body('start_time')
        .notEmpty().withMessage('Time is required')
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .withMessage('Invalid time format (HH:MM:SS)'),
    
    serviceId: body('service_id')
        .notEmpty().withMessage('Service ID is required')
        .isInt().withMessage('Service ID must be an integer'),
    
    barberId: body('barber_id')
        .notEmpty().withMessage('Barber ID is required')
        .isInt().withMessage('Barber ID must be an integer'),
    
    status: body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(Object.values(constants.BOOKING_STATUS))
        .withMessage('Invalid status')
};

const validationMiddleware = {
    register: [
        commonValidators.email,
        commonValidators.password,
        commonValidators.fullName,
        commonValidators.phone,
        handleValidation
    ],
    
    login: [
        commonValidators.email,
        commonValidators.password,
        handleValidation
    ],
    
    updateProfile: [
        commonValidators.fullName,
        commonValidators.phone,
        handleValidation
    ],
    
    createBooking: [
        commonValidators.serviceId,
        commonValidators.barberId,
        commonValidators.date,
        commonValidators.time,
        commonValidators.notes,
        handleValidation
    ],
    
    updateBookingStatus: [
        param('bookingId').isInt().withMessage('Invalid booking ID'),
        commonValidators.status,
        handleValidation
    ],
    
    getAvailableSlots: [
        query('date')
            .notEmpty().withMessage('Date is required')
            .isDate().withMessage('Invalid date format'),
        query('barber_id')
            .notEmpty().withMessage('Barber ID is required')
            .isInt().withMessage('Barber ID must be an integer'),
        handleValidation
    ],
    
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Page must be a positive integer')
            .toInt(),
        query('limit')
            .optional()
            .isInt({ min: 1, max: constants.MAX_PAGE_SIZE })
            .withMessage(`Limit must be between 1 and ${constants.MAX_PAGE_SIZE}`)
            .toInt(),
        handleValidation
    ],
    
    bookingFilters: [
        query('status')
            .optional()
            .isIn(Object.values(constants.BOOKING_STATUS))
            .withMessage('Invalid status'),
        query('date_from')
            .optional()
            .isDate().withMessage('Invalid date format'),
        query('date_to')
            .optional()
            .isDate().withMessage('Invalid date format'),
        query('search')
            .optional()
            .trim()
            .isLength({ max: 100 }).withMessage('Search query too long'),
        handleValidation
    ]
};

function handleValidation(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg
        }));
        
        return res.status(400).json({
            error: constants.MESSAGES.VALIDATION_ERROR,
            details: errorMessages
        });
    }
    
    next();
}

function isWorkingDay(date) {
    const dayOfWeek = new Date(date).getDay();
    return constants.WORKING_DAYS.includes(dayOfWeek);
}

function isWithinWorkingHours(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    const [startHours, startMinutes] = constants.WORKING_HOURS.START.split(':').map(Number);
    const [endHours, endMinutes] = constants.WORKING_HOURS.END.split(':').map(Number);
    
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    
    return totalMinutes >= startTotal && totalMinutes <= endTotal;
}

function isValidTimeSlot(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return minutes % constants.SLOT_DURATION === 0;
}

module.exports = {
    ...validationMiddleware,
    handleValidation,
    isWorkingDay,
    isWithinWorkingHours,
    isValidTimeSlot,
    commonValidators
};
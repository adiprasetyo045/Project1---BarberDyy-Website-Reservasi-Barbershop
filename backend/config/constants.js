module.exports = {
    BOOKING_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },
    USER_ROLES: {
        CUSTOMER: 'customer',
        ADMIN: 'admin'
    },
    WORKING_DAYS: [1, 2, 3, 4, 5], 
    WORKING_HOURS: {
        START: '09:00:00',
        END: '18:00:00'
    },
    SLOT_DURATION: 30,
    MAX_BOOKINGS_PER_DAY: 3,
    MAX_ADVANCE_BOOKING_DAYS: 60,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    CACHE_DURATIONS: {
        SERVICES: 3600, 
        BARBERS: 3600,
        AVAILABLE_SLOTS: 300 
    },
    VALIDATION: {
        EMAIL_MAX_LENGTH: 100,
        NAME_MAX_LENGTH: 100,
        PHONE_MAX_LENGTH: 20,
        PASSWORD_MIN_LENGTH: 6,
        NOTES_MAX_LENGTH: 500
    },
    MESSAGES: {
        SUCCESS: 'Operation completed successfully',
        NOT_FOUND: 'Resource not found',
        UNAUTHORIZED: 'Unauthorized access',
        FORBIDDEN: 'Access forbidden',
        VALIDATION_ERROR: 'Validation failed',
        SERVER_ERROR: 'Internal server error',
        REGISTER_SUCCESS: 'Registration successful',
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logout successful',
        INVALID_CREDENTIALS: 'Invalid email or password',
        EMAIL_EXISTS: 'Email already registered',
        PASSWORD_MISMATCH: 'Passwords do not match',
        BOOKING_CREATED: 'Booking created successfully',
        BOOKING_UPDATED: 'Booking updated successfully',
        BOOKING_CANCELLED: 'Booking cancelled successfully',
        SLOT_UNAVAILABLE: 'Time slot not available',
        MAX_BOOKINGS_REACHED: 'Maximum bookings reached for today'
    }
};
// Rutas para usuarios mdule

const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const ReservationController = require('./controllers/reservationController');

// list users
router.get('/reservations', ReservationController.findAll)

// create user
router.post('/reservations', 
    /*[
        check('email', 'Email is required' ).isEmail(),
        check('password', 'Password is required').not().isEmpty(),
        check('roles', 'Role is required').not().isEmpty()
    ],*/
    ReservationController.save
)

// update user
router.put('/reservations/:id', ReservationController.update)

// update user
router.delete('/reservations/:id', ReservationController.delete)

module.exports = router;

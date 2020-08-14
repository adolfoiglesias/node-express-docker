// Rutas para usuarios mdule

const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const TourController = require('./controllers/TourController');

// crear un tour
/* Basico
router.post('/', () => {
    console.log("tour ->  post");
});
*/

// list users
router.get('/tours', TourController.findAll)

// create user
router.post('/tours', 
    /*[
        check('email', 'Email is required' ).isEmail(),
        check('password', 'Password is required').not().isEmpty(),
        check('roles', 'Role is required').not().isEmpty()
    ],*/
    TourController.save
)

// update user
router.put('/tours/:id', TourController.update)

// update user
router.delete('/tours/:id', TourController.delete)

module.exports = router;



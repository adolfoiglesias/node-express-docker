// Rutas para usuarios mdule

const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const UserController = require('./controllers/userController');
const RoleController = require('./controllers/roleController');


// crear un tour
/* Basico
router.post('/', () => {
    console.log("tour ->  post");
});
*/

// list roles
router.get('/roles', RoleController.findAll);

// list users
router.get('/users', UserController.findAll)

// create user
router.post('/users', 
    [
        check('email', 'Email is required' ).isEmail().normalizeEmail(),
        check('password', 'Password is required').not().isEmpty(),
      
        check('password2', 'Password not matchs with other password').custom((value, {req}) => {
                if(value !== req.body.password){
                    throw new Error('Password confirmation does not match password');
                }
                return true;
            }),
        check('roles', 'Role is required').not().isEmpty()
    ],
    UserController.save
)

// update user
router.put('/users', 
    [
        check('email', 'Email is required' ).isEmpty(),
        check('roles', 'Role is required').not().isEmpty()
    ],
    UserController.update
)

// update user
router.delete('/users', UserController.delete)



module.exports = router;



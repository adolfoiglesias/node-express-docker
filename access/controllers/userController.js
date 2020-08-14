const { validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');

const User = require('../models/user');
const Response = require('../../utils/response');
const UserService = require('../services/userService');
const UserException = require('../exceptions/userException');

const UserController = {

    // GET "/api/access/users"
    findAll : async (req, res) => {
        console.log('USerController.findAll...');
        try {
           //const users = await UserService.findAll();
           const users = await User.find({}).populate('roles').exec();
            Response.ok(res, users);

        } catch (error) {
            console.log(error);
            Response.error(res, 400, []);
        }
    },

    // POST "/api/access/users"
    save : async (req, res) => {
        
        console.log('userController.save....');
       
        // revisar si hay errores
        
        const errors = validationResult(req);
        if( !errors.isEmpty() ) {
            Response.error(res,400, {errors: errors.array()});
        }

        // extraer email y password
        const { email, password , roles} = req.body;

        try {
            const user = await UserService.save({email, password, roles});
            Response.ok(res,user);

        } catch (error) {
            console.log(error);
            if(error.name === UserException.userRepeated){
                Response.error(res, 400, {email, password});    
            } else {
                Response.error(res, 500, {});
            }
        }
    }, 

    // PUT "/api/access/users"
    update : async (req, res) => {

         // revisar el ID 
         let userDB = await User.findById(req.params.id);

          // revisar si hay errores
          const errors = validationResult(req);
          if( !errors.isEmpty() ) {
              Response.error(res,400, {errors: errors.array()});
          }
  
          // extraer email y password
          const { email, password } = req.body;
  
          try {

            const user = await  userService.update({email, password});
            Response.ok(res,user);
  
          } catch (error) {

            console.log(error); 
            if(error.name === UserException.userNotFound){
                Response.error(res, 404, req.params.id, 'User not found');
            } else if(error.name === UserException.userRepeated){
                Response.error(res, 404, req.params.id, 'User repeated');
            }else {
                Response.error(res, 500, {});
            }
          }
    },

    // DELETE "/api/access/users"
    delete : async (req, res) => {

        try {
            
            await userService.remove(res.params.id);
            Response.ok(res, {});

        } catch (error) {
            console.log(error);
            if (error.name === UserException.userNotFound){
                Response.error(res, 404, req.params.id, 'User not found');
            } else {
                Response.error(res, 500, {});
            }
        }
    }
}

module.exports = UserController;
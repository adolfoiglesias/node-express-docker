
const Role = require('../models/role');
const Response = require('../../utils/response');

const RoleController = {

    // GET "/api/access/roles"
    findAll : async (req, res) => {
        try {
            const list = await Role.find({});
            Response.ok(res, list);

        } catch (error) {
            console.log('error Role.find({})');
            console.log(error);
            Response.error(res, 400, []);
        }
    }, 

   
}

module.exports = RoleController;
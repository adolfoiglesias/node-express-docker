const Role = require('../models/role');


const RoleService = {

    init: async () => {
        //console.log('RoleService.init started');
        try {

            const total = await Role.find().estimatedDocumentCount();
            if (total === 0) {
                const role = new Role();
                role.name = "ADMIN_ROLE";
                //await role.save();

                const role2 = new Role();
                role2.name = "CUSTOMER_ROLE";
                //await role2.save();

               Role.insertMany([role, role2]);
            }
            
        } catch (error) {
            console.log(error);
        }
        
    }
}

module.exports = RoleService;

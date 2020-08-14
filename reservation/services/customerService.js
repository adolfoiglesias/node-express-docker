const LoginTypeEnum = require('../models/LoginTypeEnum')
const CustomerModel = require('../models/CustomerModel');

const bcryptjs = require('bcryptjs');


    exports.findByEmail = (email) => {
        return CustomerModel.find({'email': email}).exec();
    }


   exports.init = async () => {

        const total = await CustomerModel.find().estimatedDocumentCount();

        if(total === 0){
            salt = await bcryptjs.genSalt(10);
        
            const customer1 = {
                name: 'Customer 1',
                email: 'customer1@gmail.com', 
                loginType: LoginTypeEnum.BASIC,
                password: await bcryptjs.hash('123', salt )
            }

            const customer2 = {
                name: 'Customer 2',
                email: 'customer2@gmail.com', 
                loginType: LoginTypeEnum.BASIC,
                password: await bcryptjs.hash('123', salt )
            }

            return CustomerModel.insertMany([customer1, customer2]);
        }
    }
    

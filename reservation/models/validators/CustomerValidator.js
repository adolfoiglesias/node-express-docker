const Customer = require('../CustomerModel');

const CustomerValidator = {

    uniqueCustomerEmail: async (value) => {

        try {
            console.log('Executing uniqueCustomerEmail custom validator ');
            console.log('Value to validate ' + value);
            
            const customer = await mongoose.model('Customer', CustomerModel).find({email: value}).exec();   
            if(customer){
                return Promise.resolve(false);
            }else {
                return Promise.resolve(true);
            }
        } catch (error) {
            console.log("Error validating uniqueCustomerEmail . Value " + value);
            console.log(error);
            return Promise.resolve(false);
        }
        /*

        CustomerModel.find({email: value}, (err, data) => {

            if(err){
                console.log(err);
                return responde(false);
            }
            
            if(data.length){
                responde(false);
            }else {
                responde(true);
            }   
        });
        */
    }
}


module.exports = CustomerValidator;


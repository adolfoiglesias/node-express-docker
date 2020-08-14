const mongoose = require('mongoose');
const LoginTypeEnum = require('./LoginTypeEnum');
const CustomerValidator = require('./validators/CustomerValidator');


const customerModel = mongoose.Schema({

    name : {
        type: String,
        required: true,
        trim:true
    },
    email: {
        type:String,
        required: true,
        trim:true, 
        validate: {
            validator:  async (value) => {

                try {
                    console.log('Executing uniqueCustomerEmail custom validator ');
                    console.log('Value to validate ' + value);

                    const total = await mongoose.model('Customer', customerModel).find({}).estimatedDocumentCount();
                    
                    console.log('Customer Total in DB ' + total);

                    const customer = await mongoose.model('Customer', customerModel).find({email: value}).exec();   
                    console.log(customer); 
                    if(customer.length !== 0){
                        return Promise.resolve(false);
                    }else {
                        return Promise.resolve(true);
                    }
                } catch (error) {
                    console.log("Error validating uniqueCustomerEmail . Value " + value);
                    console.log(error);
                    return Promise.resolve(false);
                }
            },
            message:'Duplicate customer email'
        }
    },
    loginType: {
        type:String,
        enum: Object.values(LoginTypeEnum),
        required: true,
        trim:true
    },
    loginSocial: {
        type: mongoose.Schema.Types.Mixed
    },
    password: {
        type:String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

Object.assign(customerModel.statics, {
    LoginTypeEnum,
  });

  

  const customer = mongoose.model('Customer', customerModel);
  /*
  customerModel.path('email').validate( async (value, responde)  => {
    try {
        console.log('Executing uniqueCustomerEmail custom validator ');
        console.log('Value to validate ' + value);
        
        const newCustomer = await customer.find({email: value}).exec();   
        return newCustomer ? responde(false): responde(true);
        
    } catch (error) {
        console.log("Error validating uniqueCustomerEmail . Value " + value);
        console.log(error);
        responde(false);
    }
  }, );*/

  module.exports =  customer;

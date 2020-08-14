
const UserException = require('../exceptions/userException');

const bcryptjs = require('bcryptjs');

const RolEnum = require('../models/rolEnum');
const User = require('../models/user');
const Role = require('../models/role');
const RoleService = require('./roleService');


 // GET "/api/access/users"
 exports.findAll = async () => {
    return await User.find({}).populate('roles').exec();
}

// POST "/api/access/users"
exports.save = async (user) => {
    // extraer email y password
    const { email, password } = user;
    
    // Revisar que el usuario registrado sea unico
    let newUser = await User.findOne({ email });

    if(newUser) {
       throw new Error({name:UserException.userRepeated});
    }
    // crea el nuevo usuario
    newUser = new User(user);

    // Hashear el password
    const salt = await bcryptjs.genSalt(10);
    newUser.password = await bcryptjs.hash(password, salt );

    // guardar usuario
    //console.log(newUser);
    await newUser.save();

    return newUser;
} 

// PUT "/api/access/users"
exports.update = async (id, user) => {

    // revisar el ID 
    let userDB = await User.findById(id);

    // extraer email y password
    const { email, password , roles} = user;

    // Validar si existe la entidad
    if(!userDB){
        throw new Error({name:UserException.userNotFound});
    } 

    // validar si el correo es difierene 
    if(userDB.email !== email) {

        // Revisar que el email registrado sea unico
        let user = await User.findOne({ email });

        if(user) {
            throw new Error({name:UserException.userRepeated});
        }
    }
    const updatedUser = {
        email: email,
        password: password,
        roles: roles
    }
    
    // Hashear el password
    const salt = await bcryptjs.genSalt(10);
    updatedUser.password = await bcryptjs.hash(password, salt );

    // guardar usuario
    return User.findByIdAndUpdate(id, updatedUser).exec();
}

// DELETE "/api/access/users"
exports.remove = async (id) => {
    await User.findByIdAndRemove(id);
}

exports.init = async () => {
    console.log('UserService.init...');

    const total = await User.find().estimatedDocumentCount();
  
    if (total === 0) {
        await RoleService.init();

        const obj1 = new User();
        obj1.email = "email1@gmail.com";
        obj1.password = "123";
        let salt = await bcryptjs.genSalt(10);
        obj1.password = await bcryptjs.hash('123', salt );
        
        const role = await Role.findOne({name: RolEnum.ADMIN_ROLE}).exec();
       
        obj1.roles = [role];
        
        //await obj1.save();

        const obj2 = new User();
        obj2.email = "email2@gmail.com";
        salt = await bcryptjs.genSalt(10);
        obj2.password = await bcryptjs.hash('123', salt );
        obj2.roles = [role];
        
        //await obj2.save();

        return User.insertMany([obj1, obj2]);
    }
    
    /*
    await User.find().estimatedDocumentCount({}, async function(err, result) {
        if (err) {
            throw new Error(err);
        } else {
        
            
        }
    });*/
}

/*
module.exports = {
    userService: UserService
}*/
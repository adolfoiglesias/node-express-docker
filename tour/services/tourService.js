
const Tour = require('../models/tour');
const CategoryEnum = require ('../models/categoryEnum');


    exports.findAll = (name) => {
        if(name){
            //return  Tour.find({name: { $regex: '.*' + name + '.*' }}).exec();   // funciona
            return  Tour.find({name: { $regex: name}}).exec();    // funciona tambien
        }else {
            return  Tour.find({}).exec();
        }
    }, 

    exports.save = (tour) => {
        return new Tour(tour).save();
    },
    exports.update = (id, tour) => {
        // guardar tour
        return   Tour.findByIdAndUpdate(id, tour).exec();
    },  
    exports.remove = (id) => {
         return Tour.findByIdAndRemove(id).exec();
    }, 

    exports.init = async () => {
        
        const total = await Tour.find().estimatedDocumentCount();
      
        if (total === 0) {
            const tour1 = {
                name: 'Tour 1',
                price: '100',
                categories: [CategoryEnum.CULTURAL, CategoryEnum.NIGHT]
            }
    
            const tour2 = {
                name: 'Tour 2',
                price: '200',
                categories: [CategoryEnum.WATER]
            }
    
            return Tour.insertMany([tour1, tour2]);
        } 
        
    }

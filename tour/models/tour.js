const mongoose = require('mongoose');
const CategoryEnum = require('./categoryEnum');


const TourSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    categories: [
        {
            type: String,
            enum: Object.values(CategoryEnum),
            required: true
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    price: {
        type:Number,
        default:0.0,
        required: true
    },
    images: [{
        image:Buffer
    }]
});
Object.assign(TourSchema.statics, {
    CategoryEnum,
  });

module.exports = mongoose.model('Tour', TourSchema);
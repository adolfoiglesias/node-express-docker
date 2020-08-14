const assert = require('assert');

const TourService = require("../tour/services/tourService");
const Tour = require('../tour/models/tour');
const CategoryEnum = require("../tour/models/categoryEnum");



describe('Tours testing', () => {

    beforeEach( async () => {
        console.log('beforeEach started ');
       
        await TourService.init();    
        console.log('beforeEach ended ');
    });
    
    afterEach( async () => {
        console.log('afterEach testing');
    
        await Tour.deleteMany({}).exec();
        console.log('afterEach testing ended');
    });

    it('When list tours service then there must be 2 tours',  (done)  => {
        
        const name = 'Tour';
        
        TourService.findAll(name).then(data => {
            assert(data.length === 2);    
            done();
         });
    });

    it('When save new tour service then there must be 3 tours',  (done)  => {
        
        const tour1 = {
            name: 'Tour 3',
            price: '300',
            categories: [CategoryEnum.NIGHT]
        }
         new Tour(tour1).save().then(data => {

            TourService.findAll().then(tours => {
                tours.should.length(3, 'There are not 3 users');
            
                tours = tours.filter( u => u.name === tour1.name);
                tours.should.length(1, 'Tour not exists');
    
                // verificando roles = 1 y role = admin
                const cats = tours[0].categories.filter(r => r === CategoryEnum.NIGHT);
                cats.should.length(1, "Category night not exits");
                done();
            });
         });
        
   });
 
});    
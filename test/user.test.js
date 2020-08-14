
const assert = require('assert');
const request = require('supertest');
const should = require('should');

const app = require('../index');
const UserService = require('../access/services/userService');

const RoleService = require('../access/services/roleService');

const User = require('../access/models/user');
const Role = require('../access/models/role');
const RoleEnum = require('../access/models/rolEnum');
const { update } = require('../access/services/userService');

describe('User testing', () => {

    beforeEach( async () => {
        console.log('beforeEach started ');
        /*
        Promise.all([  UserService.init()])
            .then(values => { 
                console.log('beforeEach ended');  
                done();
            });*/
        await UserService.init();    
        console.log('beforeEach ended ');
    });
    
    afterEach( async () => {
        console.log('afterEach testing');
    
        await User.deleteMany({}).exec();
        await Role.deleteMany({}).exec();
    
        console.log('afterEach testing ended');
    
    });

    it('When list users service then there must be 2 users', async ()  => {
        const users = await UserService.findAll();
        assert(users.length === 2);    
    });

    it('When List users from controller then there must be 2 users ', done => {
        
        request(app)
            .get('/api/access/users')
            .end((err, response) => {
                assert(response.body.data.length === 2 );
                done();
            });
    });
    
    it('When save new user with one ADMIN role then there must be one user with role ADMIN ' +
        ' and there must be 3 users in total', async () => {

        const role = await Role.findOne({name:RoleEnum.ADMIN_ROLE});

        const user = {
            email:'email3@gmail.com',
            password:'1234',
            roles: [role]
        }
        await new User(user).save();

        const users = await UserService.findAll();

        users.should.length(3, 'There are 3 users');
        
        const newUsers = users.filter( u => u.email === user.email);
        newUsers.should.length(1, 'User exists');

        // verificando roles = 1 y role = admin
        const roles = newUsers[0].roles.filter(r => r.name === RoleEnum.ADMIN_ROLE);
        roles.should.length(1, "Rol admin not exits");
    });

    it('When save new user with one ADMIN role from Controller then there must be one user with role ADMIN ' +
    ' and there must be 3 users in total', done => {

        Role.findOne({name:RoleEnum.ADMIN_ROLE}).then((role) => {

            const user = {
                email:'email3@gmail.com',
                password:'1234',
                password2:'1234',
                roles: [role]
            }
            request(app)
                .post('/api/access/users')
                .send(user)
                /*.expect({}) // expected response*/
                .end(async (err, response) => {
                    if(err) {
                        done(err);
                    }    
                    
                    const users = await UserService.findAll();
                    const newUsers = users.filter( u => u.email === user.email);
                    
                    newUsers.should.length(1, 'User exists');
                    // verificando roles = 1 y role = admin
                    const roles = newUsers[0].roles.filter(r => r.name === RoleEnum.ADMIN_ROLE);
                    roles.should.length(1, "Rol admin not exits");
                    done();
                });
        });
    });

    it('When save new user with error from Controller then there must be error = true ', done => {

        Role.findOne({name:RoleEnum.ADMIN_ROLE}).then((role) => {

            const user = {
                email:'email3@gmail.com',
                password:'1234'
            }
            request(app)
                .post('/api/access/users')
                .send(user)
                /*.expect({}) // expected response*/
                .end(async (err, response) => {
                    console.log(response.body)
                    if(err) {
                        done(err);
                    }    
                    assert(response.body.error, true);
                    assert(response.body.data.errors.length, 2);
                    done();
                });
        });
    });

    it('When update user , changing its roles then it must change roles ', async () => {
        const email = 'email1@gmail.com';

        const role = await Role.findOne({name:RoleEnum.CUSTOMER_ROLE}).exec();

        let userTemp = await User.findOne({email: email}).populate('roles').exec();
        console.log('userTemp...');
        console.log(userTemp);

        userTemp.roles = [...userTemp.roles, role];
        await UserService.update(userTemp.id, userTemp);
        
        const updatedUser = await User.findOne({email: email}).populate('roles').exec();
        //console.log(updatedUser);
        assert(updatedUser.email === email);
        assert(updatedUser.roles.length === 2);
        assert(updatedUser.roles.filter(r => r.name === RoleEnum.CUSTOMER_ROLE).length === 1);

    });

    /*
    it('When update user , changing its email for new one then it must change email ', () => {

    });

    it('When update user, changing its email for repetead one then it must not change email ', () => {

    });*/


});


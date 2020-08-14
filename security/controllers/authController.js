
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const queryString = require('query-string');
const Axios = require('axios');

const mogoose = require('mongoose');

const { validationResult } = require('express-validator');

const User = require('../../access/models/user');
const Rol = require('../../access/models/role');
const Response = require('../../utils/response');

const CustomerService = require('../../reservation/services/customerService');
const CustomerModel = require('../../reservation/models/CustomerModel');
const LoginTypeEnum = require('../../reservation/models/LoginTypeEnum');

const REDIRECT_URL_GMAIL = 'http://localhost:4000/api/auth/authenticate/google';
const GMAIL_SCOPE = [
   'https://www.googleapis.com/auth/userinfo.email',
   'https://www.googleapis.com/auth/userinfo.profile',
   'openid'
];

const LOGIN_GMAIL_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_GMAIL_URL = 'https://oauth2.googleapis.com/token';
const USER_INFO_GMAIL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// ------------- Facebook
const REDIRECT_URL_FB = 'http://localhost:4000/api/auth/authenticate/facebook';
const TOKEN_FACEBOOK_URL = 'https://graph.facebook.com/v4.0/oauth/access_token';



const AuthController = {


    login : async (req, res) => {
        // revisar si hay errores
       
        const errors = validationResult(req);
        if( !errors.isEmpty() ) {
            Response.error(res, 400, {errors:errors.array()});
        }

        // extraer el email y password
        const { email, password } = req.body;

        try {
            // Revisar que sea un usuario registrado
            let user = await User.findOne({ email });
            if(!user) {
                return res.status(400).json({msg: 'El usuario no existe'});
            }

            // Revisar el password
            const passCorrecto = await bcryptjs.compare(password, user.password);
            if(!passCorrecto) {
                return res.status(400).json({msg: 'Password Incorrecto' })
            }

            // Si todo es correcto Crear y firmar el JWT
            const payload = {
                usuario: {
                    id: user.id
                }
            };

            // firmar el JWT
            jwt.sign(payload, process.env.JWT_SECRETA, {expiresIn: 3600 /* 1 hora*/}, 
                (error, token) => {
                    if(error) throw error;

                    // Mensaje de confirmación
                    res.json({ token  });
                });

        } catch (error) {
            console.log(error);
        }
    },

    // Obtiene que usuario esta autenticado
    getLoggedUser : async (req, res) => {
        try {
            const user = await User.findById(req.usuario.id).select('-password');
            return Response.ok(res, user);
        } catch (error) {
            console.log(error);
            Response.error(res, 500, null, error);
        }
    },

    getLoginFB: (req, res) => {

        const stringifiedParams = queryString.stringify({
            client_id: process.env.CLIENT_ID_FB,
            redirect_uri: REDIRECT_URL_FB,
            scope: ['email', 'pages_show_list'].join(','), // comma seperated string
            response_type: 'code',
            auth_type: 'rerequest',
            display: 'popup',
        });
        
        const facebookLoginUrl = `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`;
        return Response.ok(res, facebookLoginUrl);
    },

    getLoginGmail: (req, res) => {
        const stringifiedParams = queryString.stringify({
            client_id: process.env.CLIENT_ID_GMAIL,
            redirect_uri: REDIRECT_URL_GMAIL,
            scope: GMAIL_SCOPE.join(' '), // space seperated string
            response_type: 'code',
            access_type: 'offline',
            prompt: 'consent',
          });
          
          const googleLoginUrl = `${LOGIN_GMAIL_URL}?${stringifiedParams}`;
          return Response.ok(res, googleLoginUrl);
    },

    getAccessTokenGmailFromCode: async (req, res) => {

        const urlParams = req.query.code;

        try {
            const { data } = await Axios({
                url: TOKEN_GMAIL_URL,
                method: 'post',
                data: {
                  client_id: process.env.CLIENT_ID_GMAIL,
                  client_secret: process.env.APP_SECRET_GMAIL,
                  redirect_uri: REDIRECT_URL_GMAIL,
                  grant_type: 'authorization_code',
                  code: urlParams,
                },
              });
              console.log('Gmail User Token....');
              console.log(data); // { access_token, expires_in, token_type, refresh_token }

              const info = await AuthController.getGoogleDriveFiles(data.access_token);
              console.log('gmail user info....');
              console.log(info);

              return AuthController.addOrUpdateCustomer(data, info, res, LoginTypeEnum.GMAIL);


        } catch (error) {
            console.log(error);
            Response.error(res,500, 'Error autenticando con gmail');   
        }
    },


    addOrUpdateCustomer: async (data, info, res, loginTypeEnum) => {
        let customers = await  CustomerService.findByEmail(info.email);
        let customer = customers[0];

        const session = await CustomerModel.startSession();

        if(customer) {
            console.log('updating customer');
          // update de token
          customer.loginSocial = {data, info};

          return session.withTransaction(async ()=> {
              await CustomerModel.findByIdAndUpdate(customer._id, customer).session(session).exec();
              Response.ok(res,customer);    
          });

        } else {
          console.log('creating customer...');
          // new customer
          customer  = new CustomerModel({
              loginType: loginTypeEnum,
              loginSocial: data,
              email: info.email,
              name: info.name
          });

          return session.withTransaction(async ()=> {
              await customer.save({session});
              Response.ok(res,customer);    
          });
        }
    },


    getAccessTokenFBFromCode: async (req, res) => {

        const urlParams = req.query.code;

        try {
              const { data } = await Axios({
                url: TOKEN_FACEBOOK_URL,
                method: 'get',
                params: {
                  client_id: process.env.CLIENT_ID_FB,
                  client_secret: process.env.APP_SECRET_FB,
                  redirect_uri: REDIRECT_URL_FB,
                  code:urlParams
                },
              });

              console.log(data); // { access_token, expires_in, token_type, refresh_token }

              const info = await AuthController.getFacebookUserData(data.access_token);
              
              return AuthController.addOrUpdateCustomer(data, info, res, LoginTypeEnum.FACEBOOK);

        } catch (error) {
            console.log(error);
            Response.error(res,500, 'Error autenticando con gmail');   
        }
    },

    getGoogleDriveFiles: async (accessToken) => {
        
        const { data } = await Axios({
          url: USER_INFO_GMAIL,
          method: 'get',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
       // console.log(data); // { id, email, given_name, family_name }
        return data;
    },

    getFacebookUserData : async (access_token) => {
        const { data } = await Axios({
          url: 'https://graph.facebook.com/me',
          method: 'get',
          params: {
            fields: ['id', 'email', 'first_name', 'last_name'].join(','),
            access_token: access_token,
          },
        });
       // console.log(data); // { id, email, first_name, last_name }
        return data;
    }
}

module.exports = AuthController;
const mongoose = require('mongoose');

const DataSource = {

    connectDB: async () => {
        if(process.env.NODE_ENV === 'dev'){

            await DataSource.connectDBDev();

        } else if (process.env.NODE_ENV === 'prod') {

            await DataSource.connectDBProd();
        }
    },
    connectDBDev : async () => {
        await DataSource._connectDBInternal(process.env.DB_MONGO_DEV);
    },

    connectDBTest: async() => {
        await DataSource._connectDBInternal(process.env.DB_MONGO_TEST);
    },

    connectDBProd: async() => {
        await DataSource._connectDBInternal(process.env.DB_MONGO_PROD);
    },
    _connectDBInternal: async (urlDB) => {
        try {
           
            const connection = await mongoose.connect(urlDB, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            });
            console.log('DB Conectada');

        } catch (error) {
            console.log('hubo un error')
            console.log(error);
            process.exit(1); // Detener la app
        }
    }
}


module.exports = DataSource;
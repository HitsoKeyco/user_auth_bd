const app = require('./app');
const sequelize = require('./utils/connection');

const PORT = process.env.PORT || 8080;
//importamos models
require('./models')

const main = async () => {
    try {
        sequelize.sync({force:true});
        console.log("DB connected");
        app.listen(PORT);
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.log(error)
    }
}

main();

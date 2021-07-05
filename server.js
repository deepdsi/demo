require("dotenv").config();
let config = module.exports = require("./config.json");
const { MongoClient } = require('mongodb');
const express =  module.exports = require('express');
const helmet = require("helmet");
SERVER_PORT = ("port", process.env.PORT || 3000);

app = module.exports = express();
var secureServer = require('http').createServer(app);
secureServer.listen(SERVER_PORT);

apiHanlder = module.exports = require('./classes/apiHandler.js');

init()
async function init(){
    let connectionString = `${config.DB_PROTO}://${config.DB_HOST}/${config.DB_NAME}`;
    dclient = module.exports = await new MongoClient.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    db = module.exports = dclient.db(config.DB_NAME);
    console.log("db connected");
    apiHanlder.BindWithCluster(app)
}
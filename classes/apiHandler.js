const fetch = require('node-fetch');
const helmet = require("helmet");
const bodyParser = require('body-parser');
const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);
let { SignJWT } = require("./jwtService.js");
let { checkToken } = require("./comman.js");
const errorCode = require("../comman/dataCodes");
const { ObjectID } = require('mongodb');

module.exports = {
    BindWithCluster: function (app) {
        app.use(helmet());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        app.get('/', function (req, res) {
            res.send('ok http');
        });

        app.get('/api/users/test', function (req, res) {
            console.log("test api...");
            res.send('ok http');
        });

        app.post('/api/users/signup',async function (req, res) {
            console.log("req data",req.body);
            const schema = joi
                .object({
                    email: joi.string().email().required(),
                    name: joi.string().required(),
                    password: joi.string().required()
                })
                .required()
                .options({ allowUnknown: true, stripUnknown: true })
            
            const { error, value } = schema.validate(req.body);
            
            if (error)
                return res.send({ error: 1, message: errorCode.data.invalid });

            var userDetail = await db.collection('User').find({email: req.body.email}).toArray();
            if (userDetail.length == 0) {
                let userData = {
                    email: req.body.email,
                    name: req.body.name,
                    password: req.body.password,
                    _isOnline: false
                }
                var newUser = await db.collection('User').insertOne(userData);
                return res.send({ error: 0, data: { name: newUser.ops[0].name, email: newUser.ops[0].email, userid: newUser.ops[0]._id.toString() } });
            } else {
                return res.send({ error: 1, message: errorCode.user.userExist });
            }
        });          

        app.post('/api/users/login',async function (req, res) {
            console.log("req daya",req.body);
            const schema = joi
                .object({
                    email: joi.string().email().required(),
                    password: joi.string().required()
                })
                .required()
                .options({ allowUnknown: true, stripUnknown: true })
            
            const { error, value } = schema.validate(req.body);
            
            if (error)
                return res.send({ error: 1, message: errorCode.data.invalid });
            
            var userDetail = await db.collection('User').findOne({email: req.body.email});
            console.log(userDetail)
            if (userDetail) {
                console.log(req.body.password)
                console.log(userDetail.password)
                if(req.body.password == userDetail.password){
                    console.log("wdfdsvd")
                    await db.collection('User').updateOne({email: req.body.email},{$set:{_isOnline: true}},{ upsert: true });
                    let token = await SignJWT({ _id: userDetail._id, email: userDetail.email });

                    if (!token)
                      return res.send({ error: 1, message: errorCode.server.internalError });
          
                    return res.send({ error: 0, data: { token } });
                } else {
                    return res.send({ error: 1, message: errorCode.user.wrongPassword });
                }
            }
        });

        app.post('/api/users/addpost', checkToken, async function (req, res, next){
            console.log(req.body)
            const schema = joi
                .object({
                    Title: joi.string().required(),
                    Body: joi.string().required(),
                    Created_By: joi.string().required(),
                    Status: joi.string().required(),
                    Latitude: joi.string().required(),
                    Longitude: joi.string().required()
                })
                .required()
                .options({ allowUnknown: true, stripUnknown: true })

            const { error, value } = schema.validate(req.body);
            
            if (error)
                return res.send({ error: 1, message: errorCode.data.invalid });

            // var postDetail = await db.collection('Post').findOne({email: req.body.email, _isOnline: true});
            req.body.cd = new Date();
            req.body.location = { type: "Point", coordinates: [ parseFloat(req.body.Latitude), parseFloat(req.body.Longitude) ] };
            var postDetail = await db.collection('Post').insertOne(req.body);
            console.log(postDetail)
            if (postDetail) {
                return res.send({ error: 0, data: { postDetail } });
            } else {
                return res.send({ error: 1, message: errorCode.user.userNotExist });
            }
        });

        app.post('/api/users/removepost', checkToken, async function (req, res, next){
            console.log(req.body)
            const schema = joi
                .object({
                    postid: joi.string().required(),
                    userid: joi.string().required()
                })
                .required()
                .options({ allowUnknown: true, stripUnknown: true })

            const { error, value } = schema.validate(req.body);
            
            if (error)
                return res.send({ error: 1, message: errorCode.data.invalid });

            await db.collection('Post').remove({_id:ObjectID(req.body.postid),Created_By:req.body.userid});
            console.log("post remove")
            return res.send({ error: 0, data: { message: 'Post Removed' } });
        });

        app.post('/api/users/updatepost', checkToken, async function (req, res, next){
            console.log(req.body)
            const schema = joi
                .object({
                    postid: joi.string().required(),
                    userid: joi.string().required()
                })
                .required()
                .options({ allowUnknown: true, stripUnknown: true })

            const { error, value } = schema.validate(req.body);
            
            if (error)
                return res.send({ error: 1, message: errorCode.data.invalid });


            var update = {$set:{}};
            if(req.body.Title && req.body.Title != ''){
                update.$set.Title = req.body.Title;
            }

            if(req.body.Body && req.body.Body != ''){
                update.$set.Body = req.body.Body;
            }

            if(req.body.Status && req.body.Status != ''){
                update.$set.Status = req.body.Status;
            }

            if(req.body.Latitude && req.body.Latitude != ''){
                update.$set.Latitude = req.body.Latitude;
                update.$set.coordinates[0] = parseFloat(req.body.Latitude);
            }

            if(req.body.Longitude && req.body.Longitude != ''){
                update.$set.Longitude = req.body.Longitude;
                update.$set.coordinates[0] = parseFloat(req.body.Longitude);
            }

            db.collection('User').updateOne({postid: ObjectID(req.body.postid),Created_By:req.body.userid},update,{ upsert: true });
            return res.send({ error: 0, data: { message: 'Post Updated.' } });
        });

        app.post('/api/users/getpost', checkToken, async function (req, res, next){
            console.log(req.body)
            const schema = joi
                .object({
                    Latitude: joi.string().required(),
                    Longitude: joi.string().required()
                })
                .required()
                .options({ allowUnknown: true, stripUnknown: true })

            const { error, value } = schema.validate(req.body);
            
            if (error)
                return res.send({ error: 1, message: errorCode.data.invalid });

            var postDetail = await db.collection('Post').find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(req.body.Latitude), parseFloat(req.body.Longitude)]
                        },
                        $maxDistance: 5000
                    }
                }
            }).toArray();
            console.log("postDetail",postDetail)
            if (postDetail) {
                return res.send({ error: 0, data: { postDetail } });
            } else {
                return res.send({ error: 1, message: errorCode.post.userNotExist });
            }
        });

        app.post('/api/users/logout',async function (req, res) {
            console.log("req daya",req.body);
            const schema = joi
                .object({
                    email: joi.string().email().required()
                })
                .required()
                .options({ allowUnknown: true, stripUnknown: true })
            
            const { error, value } = schema.validate(req.body);
          
            if (error)
                return res.send({ error: 1, message: errorCode.data.invalid });
            
            var userDetail = await db.collection('User').findOne({email: req.body.email});
            if (userDetail) {
                await db.collection('User').updateOne({email: req.body.email},{$set:{_isOnline: false}},{ upsert: true });
                return res.send({ error: 0, data: { } });
            } else {
                return res.send({ error: 1, message: errorCode.user.userNotExist });
            }
        });
    }
}
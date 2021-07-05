const jwtService = require("./jwtService");
const errorCode = require("../comman/dataCodes");

async function checkToken(req, res, next) {
    console.log("wdefv")
  try {
    let check = await jwtService.VerifyJWT(req.headers.auth);
    if (check) {
      req.user = check;
      next();
    }
  } catch (checkTokenError) {
    return res.send({ error: 1, message: errorCode.auth.unauthorized });
  }
}

module.exports = {
  checkToken
}
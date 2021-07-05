const JWT = require("jsonwebtoken");
const cryptService = require("./crypt");
const jwtSecret = process.env.JWT_TOKEN;

module.exports = {
  SignJWT(data) {
    return new Promise((resolve, reject) => {
      JWT.sign(data, jwtSecret, { expiresIn: '24h' }, async (error, token) => {
        if (error)
          return reject(error);

        try {
          return resolve(await cryptService.Encryption(token));
        } catch (err) {
          return reject(err);
        }
      });
    })
  },
  VerifyJWT: async function(token) {
    return new Promise(async (resolve, reject) => {
      try {
        let decryptToken = await cryptService.Decryption(token);

        JWT.verify(decryptToken, jwtSecret, function (err, decoded) {
          if (err)
            return reject(err);

          return resolve(decoded);
        });
      } catch (err) {
        return reject(err);
      }
    })
  }
}
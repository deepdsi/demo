const CryptoJS = require("crypto-js");
const encryptionKey = process.env.ENC_KEY;

module.exports = {
  Encryption(text) {
    return new Promise((resolve, reject) => {
      try {
        let encryptData = CryptoJS.AES.encrypt(text, encryptionKey).toString();
        return resolve(encryptData);
      } catch (err) {
        return reject(err);
      }
    });
  },

  Decryption(cipherText) {
    return new Promise((resolve, reject) => {
      try {
        let bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
        let decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return resolve(decrypted);
      } catch (err) {
        console.log("000000 ", err);
        return reject(err);
      }
    });
  },
}
const multer = require("multer");
const {v4: uuidv4} = require("uuid");
//3
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads') //1
    },
    filename: function (req, file, cb) {
      //2
      const unique = uuidv4(); //2 with this we get unique name
      cb(null,unique + path.extname(file.originalname) ) //4 // unique name k aage file ka extension lg jayega
    }
  })
  
  const upload = multer({ storage: storage }) //is upload variable ki help sai hi hmari images upload hoti hai
  module.exports = upload; // 5 now export upload
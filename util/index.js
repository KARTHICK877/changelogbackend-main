const multer = require("multer");
const path = require('path');


// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads'); // Directory to save uploaded files
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Set filename with original extension
    }
  });
  
   const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4/; // Accepted file types
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check file extension
    const mimetype = filetypes.test(file.mimetype); // Check file mimetype
    if (extname && mimetype) {
      return cb(null, true); // Accept the file if both extension and mimetype are valid
    } else {
      cb('Error: Only images and videos are allowed!'); // Reject the file if invalid
    }
  };
  
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter
  });
  
  module.exports ={upload}
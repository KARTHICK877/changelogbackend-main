const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require('express-handlebars');

var cors = require("cors");
const { initializeSequelize } = require("./dbconfig/configuration");
const changelogroute = require("./routes/index");
 const app = express();
 
const PORT = process.env.PORT || 8080;

initializeSequelize();



app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
 // Routes
app.use("/", changelogroute);

app.listen(PORT, () => {
  console.log(`Express is running on port ${PORT}`);
});

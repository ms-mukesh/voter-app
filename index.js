const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./models");
const tokenChecker = require("./middleware/headerTokenChecker");
db.sequelize.sync();
const app = express();
const userAuthentication = require("./routes/userAuthentication");
const userActions = require("./routes/userActions")
const notification = require("./routes/notificationRoute")
const event = require("./routes/event")
const volunteer = require("./routes/volunteer")
app.use(cors());
// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/userAuthentication", userAuthentication);
app.use(tokenChecker);
app.use("/userActions", userActions);
app.use("/notification", notification);
app.use("/event", event);
app.use("/volunteer", volunteer);


app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

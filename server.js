/*
Environmental variables
 - PORT
 - MONGO_URL
*/

require("coffee-script/register");
app = require("./controllers/host.coffee");
http = require("http");
port = process.env.PORT || 2222;

http.createServer(app).listen(port, function () {
   console.log("Dominion listening on " + port);
});
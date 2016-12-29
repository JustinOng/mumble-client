var MumbleClient = require("./MumbleClient.js");
var config = require("./config.js")

var client = new MumbleClient();

client.connect(config.host, config.port);
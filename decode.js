var readline = require("readline");
var fs = require("fs");
var p = require("node-protobuf");
var PacketTypes = require("./MumblePacketTypes.js");
var utilities = require("./utilities.js");

var pb = new p(fs.readFileSync("mumble.desc"));

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
  var buf = new Buffer(line.replace(/:/g, ""), "hex");
  
  var proto_type = utilities.val2key(buf.readUInt16BE(0), PacketTypes);
  var proto_length = buf.readUInt32BE(2);
  var obj = pb.parse(buf.slice(6, 6+proto_length), proto_type);
  console.log(proto_type, obj);
})
var fs = require("fs");
var p = require("node-protobuf");
var net = require("net");
var tls = require("tls");
var PacketTypes = require("./MumblePacketTypes.js");
var config = require("./config.js");
var utilities = require("./utilities.js");

var pb = new p(fs.readFileSync("mumble.desc"));

var MumbleClient = function() {
  var client = this;

  var sc = tls.createSecureContext({
    "pfx": config.tls_cert
  });

  // https://github.com/nodejs/node/issues/3963
  this.socket = new tls.TLSSocket(undefined, {
    "secureContext": sc
  });

  this.socket_chunks = [];

  // set encoding to null for binary data
  this.socket.setEncoding(null);

  //https://github.com/nodejs/node/issues/6038
  delete this.socket._readableState.decoder;

  this.socket.on("data", function(buf) {
    client.receive_proto.call(client, buf);
  });
}

MumbleClient.prototype.receive_proto = function(buf) {
  this.socket_chunks.push(buf);

  // if size of first buffer in socket_chunks is not a full prefix, compact it and test if its enough
  if (this.socket_chunks[0].length < 6) {
    this.socket_chunks = [Buffer.concat(this.socket_chunks)];
    
    // not enough data to keep parsing, exit
    if (this.socket_chunks[0].length < 6) {
      return;
    }
  }

  var proto_type = utilities.val2key(this.socket_chunks[0].readUInt16BE(0), PacketTypes);
  var proto_length = this.socket_chunks[0].readUInt32BE(2);
  
  if (this.socket_chunks[0] < (6 + proto_length)) {
    this.socket_chunks = [Buffer.concat(this.socket_chunks)];
    
    // not enough data to keep parsing, exit
    if (this.socket_chunks[0] < (6 + proto_length)) {
      return;
    }
  }

  console.log("Received prototype", proto_type,"with length", proto_length);

  console.log(this.socket_chunks);

  // prefix length is 6, length bytes after is protobuf data
  var obj = pb.parse(buf.slice(6, 6+proto_length), proto_type);

  // remove the just parsed protobuf message from socket_chunks
  this.socket_chunks[0] = this.socket_chunks[0].slice(6+proto_length);

  console.log(obj);
}

MumbleClient.prototype.send_proto = function(obj, prototype) {
  if (!(prototype in PacketTypes)) {
    console.error("Invalid prototype:", prototype);
    return;
  }

  var protobuf = pb.serialize(obj, prototype);

  var prefix = new Buffer(6);
  prefix.writeUInt16BE(PacketTypes[prototype], 0);
  prefix.writeUInt32BE(protobuf.length, 2);

  var buf = Buffer.concat([prefix, protobuf]);
  console.log(buf);
  console.log(buf.length);
  
  this.socket.write(buf);
}

MumbleClient.prototype.connect = function(server, port) {
  var client = this;

  client.socket.connect(port, server, function() {
    console.log("Socket opened");

    client.send_proto({
      "version": (1 << 16) + (6 << 8) + 9,
      "release": "Some release",
      "os": "Node.js",
      "os_version": "v6.4.0"
    }, "MumbleProto.Version");

    client.send_proto({
      "username": "Bot",
      "password": "removed"
    }, "MumbleProto.Authenticate");

    client.send_proto({
      "opus": true
    }, "MumbleProto.UserStats");
  });
}

module.exports = MumbleClient;
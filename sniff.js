var pcap = require('pcap'),
  tcp_tracker = new pcap.TCPTracker(),
  pcap_session = pcap.createSession('', "ip proto \\tcp");

tcp_tracker.on("session", function (session) {
  console.log("Start of TCP session between " + session.src_name + " and " + session.dst_name);
  
  session.on("data send", function (session, data) {
    console.log(session.src_name + " -> " + session.dst_name + " data send " + " + " + data.length + " bytes");
    console.log(data);
  });
  
  /*session.on("data recv", function (session, data) {
    console.log(session.dst_name + " -> " + session.src_name + " data recv " + " + " + data.length + " bytes");
  });*/
  
  session.on("end", function (session) {
    console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
  });
});

pcap_session.on('packet', function (raw_packet) {
  var packet = pcap.decode.packet(raw_packet);
  tcp_tracker.track_packet(packet);
});
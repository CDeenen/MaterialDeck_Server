const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ port: 3003 });

const DEBUG = 1;

webSockets = {} // userID: webSocket
let foundryConnected = false;
let streamDeckConnected = false;
let pluginId;
wss.on('connection', function connection(ws,req) {
  let source;
  var userID = parseInt(req.url.substr(1), 10)
  webSockets[userID] = ws;

  if (userID == 1){
    //Set ping interval
    const id = setInterval(function () {
      webSockets[1].send("{\"T\":\"P\"}")
  }, 1000);
  }

  
  ws.on('message', function incoming(msg) {
    msgJSON = JSON.parse(msg);
    if (DEBUG == 2) console.log(msgJSON);
    if (msgJSON.type == "init"){
      if (msgJSON.source == "SD"){
        source = 'SD';
        streamDeckConnected = true;
        pluginId = msgJSON.pluginUUID;
        console.log("Connected to Stream Deck");
      }
    }
    else if (msgJSON.type == "Foundry"){
      source = 'F';
      foundryConnected = true;
      let msg = {
        data: 'init',
        pluginUUID: pluginId,
        streamDeckConnected: streamDeckConnected
      }
      ws.send(JSON.stringify(msg))
      console.log("Connected to Foundry");
      
    }
    //else {
      if (userID == 0 && foundryConnected) {
        if (DEBUG) console.log('sent to ' + 1 + ': ' + msg);
        webSockets[1].send(msg);
      }
      else if (userID == 1 && streamDeckConnected) {
        if (DEBUG)  console.log('sent to ' + 0 + ': ' + msg);
        webSockets[0].send(msg);
      }
    //}
  });

  ws.on('close', function close() {
    if (source == 'F')
      console.log('Disconnected from Foundry');
    else
      console.log('Disconnected from Stream Deck');
  });
});

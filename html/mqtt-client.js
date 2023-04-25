const client = new Paho.Client("mqtt.my-tst-playground.com", 8081, "poc-client");

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

function connect() {
    console.log("Connecting ....");
    var options = {
        useSSL: true,
        // userName : "***",
        // password : "********",
        onSuccess: onConnect,
        onFailure: onFailure
    };
    client.connect(options);
}

function onConnect() {
    console.log("Connected");
    client.subscribe("/poc/test");
    sendMessage();
}

function onFailure(err) {
    console.log("Failed to connect " + err.errorMessage);
}

function disconnect() {
    client.disconnect();
    console.log("Disconnected");
}

function sendMessage() {
    console.log("Sending message");
    const message = new Paho.Message("Hello MQTT POC");
    message.destinationName = "/poc/test";
    client.send(message);
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection lost: " + responseObject.errorMessage);
    }
}

function onMessageArrived(message) {
    console.log("Message arrived: " + message.payloadString);
}

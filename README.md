## Introduction

The following is an end-to-end example of running Mosquitto 

- in docker(-compose)
- with all listener enabled 
- using self-signed certificates
- nginx server allowing us to accept the self signed certificate via https

We are using a self-signed certificate here.
A public resolvable DNS Name `mqtt.my-tst-playground.com` is also available pointing to `127.0.0.1`

## Ports used

The ports used in this example: 

1883 : MQTT, unencrypted
8883 : MQTT, encrypted
8884 : MQTT, encrypted, client certificate required
8080 : MQTT over WebSockets, unencrypted
8081 : MQTT over WebSockets, encrypted

The websocket ports aren't really standadised. Some use 9001, 8884, ....

## Docker

We're going to be running mosquitto in docker, so there's no need to download / unzip or build mosquitto yourself.
Eclipse has an official `eclipse-mosquitto` image that we can use.

The only thing we need to provide is a valid `mosquitto.conf` file.

A very simple version of a `mosquitto.conf` file might look like this

```
allow_anonymous true
listener 1883

log_dest stdout
log_type all
```

## Docker standalone

A very simple way to start mosquitto in a docker container from a folder where you also have the `mosquitto.conf` file is this:

```
docker stop mosquitto-poc ; docker rm -f mosquitto-poc
docker run -d -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf -p 1883:1883 -p 9001:9001 --name mosquitto-poc eclipse-mosquitto 
```

## Docker compose

Docker compose makes it easier to centralize all of this configuration and volume mappings.
It also include the nginx proxy.


## Publishing / Subscribing to messages

In the `scripts` folder are some simple scripts to publish and subscribe to topics:

```
docker-compose exec -ti mosquitto mosquitto_pub -h localhost -p 1883 -t poc/test -m "Hello from the command line"
docker-compose exec -ti mosquitto mosquitto_sub -d -t "/poc/test"

```

## Self signed certificates SSL

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=US/O=Nginx/OU=Nginx Github Test/CN=my-tst-playground.com"

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
openssl pkcs12 -export -in cert.crt -inkey key.pem -out cert_key.pfx


## Javascript / Node libraries

- https://github.com/mqttjs/MQTT.js/blob/main/examples/wss/client_with_proxy.js
- https://github.com/eclipse/paho.mqtt.javascript


## Test sites

We can use the following external clients to verify the connection

https://www.hivemq.com/demos/websocket-client/
https://www.eclipse.org/paho/index.php?page=clients/js/utility/index.php

Enter 




## Errors

If you try to establish a websocket connection in your browser with a self signed certificate you will get an error


```
WebSocket connection to 'wss://mqtt.my-tst-playground.com:9001/mqtt' failed: 

ClientImpl._doConnect @ 8a0a83163b4a9113300683b2da3d723a30753888.js:924
ClientImpl.connect @ 8a0a83163b4a9113300683b2da3d723a30753888.js:795
Client.connect @ 8a0a83163b4a9113300683b2da3d723a30753888.js:1614
connect @ 8a0a83163b4a9113300683b2da3d723a30753888.js:2286
onclick @ (index):144
8a0a83163b4a9113300683b2da3d723a30753888.js:2302 error: AMQJS0007E Socket error:undefined.
```

It will actually fail on the websocket connection

```
    ClientImpl.prototype._doConnect = function (host, port) {
        // When the socket is open, this client will send the CONNECT WireMessage using the saved parameters. 
        if (this.connectOptions.useSSL)
            wsurl = ["wss://", host, ":", port, "/mqtt"].join("");
        else
            wsurl = ["ws://", host, ":", port, "/mqtt"].join("");
        this.connected = false;
        this.socket = new WebSocket(wsurl, 'mqttv3.1');
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = scope(this._on_socket_open, this);
        this.socket.onmessage = scope(this._on_socket_message, this);
        this.socket.onerror = scope(this._on_socket_error, this);
        this.socket.onclose = scope(this._on_socket_close, this);

        this.sendPinger = new Pinger(this, window, this.connectOptions.keepAliveInterval);
        this.receivePinger = new Pinger(this, window, this.connectOptions.keepAliveInterval);

        this._connectTimeout = new Timeout(this, window, this.connectOptions.timeout, this._disconnected, [ERROR.CONNECT_TIMEOUT.code, format(ERROR.CONNECT_TIMEOUT)]);
    };
```

## Screenshots

[](./images/browser-connection-not-private.png)
[](./images/browser-connection-proceed.png)
[](./images/browser-mqtt-connected.png)
[](./images/browser-connection-continued-not-secure.png)
[](./images/certificate-details.png)
[](./images/console-error-ERR_CERT_AUTHORITY_INVALID.png)
[](./images/console-error-ERR_CERT_AUTHORITY_INVALID2.png)
[](./images/console-ok-webclient-messages.png)
[](./images/console-ok-webclient.png)
[](./images/hivemq-client.png)


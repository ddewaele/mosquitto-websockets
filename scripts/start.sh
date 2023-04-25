docker stop mosquitto-poc ; docker rm -f mosquitto-poc
docker run -d -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf -p 1883:1883 -p 9001:9001 --name mosquitto-poc eclipse-mosquitto 

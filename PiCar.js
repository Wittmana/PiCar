const mqtt = require('mqtt');
const Gpio = require('pigpio').Gpio;

//Credentials for MQTT Server
const options =
{
        port: '1883',
        host: '192.168.0.16',
        username: 'bucserve',
        password: 'E+$uBu($'
};

//Connect to the broker
client.on('connect', function ()
{
        console.log("\nController connected to broker.\n");
});

//Initiate motor controller
const rightReverse = new Gpio(17, {mode: Gpio.OUTPUT});
const leftFoward = new Gpio(27, {mode: Gpio.OUTPUT});
const rightFoward = new Gpio(22, {mode: Gpio.OUTPUT});
const leftReverse = new Gpio(23, {mode: Gpio.OUTPUT});

//Set all motors to 0
leftReverse.pwmWrite(0);
rightFoward.pwmWrite(0);
leftFoward.pwmWrite(0);
rightReverse.pwmWrite(0);

setInterval(function()
{
	//leftReverse.pwmWrite(200);
	//rightFoward.pwmWrite(100);
	//leftFoward.pwmWrite(100);
	//rightReverse.pwmWrite(200);
});

process.on('SIGINT', function()
{
	leftReverse.pwmWrite(0);
	rightFoward.pwmWrite(0);
	rightReverse.pwmWrite(0);
	leftFoward.pwmWrite(0);
	delete rightReverse;
	delete leftFoward;
	process.exit(0);
});
const mqtt = require('mqtt');
const Gpio = require('pigpio').Gpio;

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

//Credentials for MQTT Server
const options =
{
        port: '1883',
        host: '192.168.0.16',
        username: 'bucserve',
        password: 'E+$uBu($'
};

//Connect to the server using the credentials
const client = mqtt.connect(options);

//Connect to the broker
client.on('connect', function ()
{
        console.log("\nPi connected to broker.\n");
		client.subscribe('sub', function (err)
		{
			if (err) throw "Error description: " + err;
		});
		client.subscribe('data', function (err)
		{
			if (err) throw "Error description: " + err;
		});
});

client.on('message', async function(topic, message)
{
	if (topic == 'sub')
	{
		client.publish("ack", "", function (err)
		{
			if (err) throw "Error Description: " + err;
		});	
	}
	if (topic == 'data')
	{
		if(message == 'foward')
		{
			console.log("Recieved Foward");
			rightFoward.pwmWrite(255);
			leftFoward.pwmWrite(255);
			await sleep(1000);
			rightFoward.pwmWrite(0);
			leftFoward.pwmWrite(0);
		}
		else if(message == 'exit')
		{
			console.log("Recieved Exit");
			leftReverse.pwmWrite(0);
			rightFoward.pwmWrite(0);
			rightReverse.pwmWrite(0);
			leftFoward.pwmWrite(0);
			delete rightReverse;
			delete leftFoward;
			process.exit(0);
		}
	}
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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
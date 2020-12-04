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

client.on('message', function(topic, message)
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
		if (message == 'stop')
		{
			console.log("Recieved Stop")
			stop();
		}
		else if(message == 'foward')
		{
			console.log("Recieved Foward");
			stop();
			rightFoward.pwmWrite(255);
			leftFoward.pwmWrite(255);
		}
		else if(message == 'reverse')
		{
			console.log("Recieved Revers")
			stop();
			rightReverse.pwmWrite(255);
			leftReverse.pwmWrite(255);
		}
		else if(message == 'right')
		{
			console.log("Recieved Revers")
			stop();
			leftFoward.pwmWrite(150);
		}
		else if(message == 'left')
		{
			console.log("Recieved Revers")
			stop();
			rightFoward.pwmWrite(150);
		}
		else if(message == 'exit')
		{
			console.log("Recieved Exit");
			stop();
			delete rightReverse;
			delete leftFoward;
			process.exit(0);
		}
	}
});

function stop() {
	leftReverse.pwmWrite(0);
	rightFoward.pwmWrite(0);
	rightReverse.pwmWrite(0);
	leftFoward.pwmWrite(0);
}

process.on('SIGINT', function()
{
	stop();
	delete rightReverse;
	delete leftFoward;
	process.exit(0);
});
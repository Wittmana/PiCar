const mqtt = require('mqtt');
const Gpio = require('pigpio').Gpio;
const NodeRSA = require('node-rsa');

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

//Create key for encryption: 1024 bit encryption
const key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
'MIICXAIBAAKBgQCJvh+nxi5ip+cv33Eumo/1Q/JYiBjKKoLV+dWQbYvx2FetP2Oh\n'+
'/IQNFH/c1GtGaWwi0OCfGqNIUHmYhrVDN/h6d2Ap5w6WG/QQO3xo+JboK/Sed8iu\n'+
'r6BrYa8wPkmlE3l6JEHLKY7sUXFGYnvz6cJRa7FvOLzUzzOHrZQh2B5WTQIDAQAB\n'+
'AoGAPDvy9dg5YpUQCSRKB1o5x8R9zu88//NVIaNOHAl7oDe+J5nHxQd664liXLxb\n'+
'aQAi9JqpD4qDitT+R4/o5ksskiUFuRaPvMXp8dyG3RxBvatU3cjHmvvkRpGyUtfa\n'+
'udhJJV9ZY/lzFA8FP2NZYv0mgTsEsS3LeEiAY6T9Avd+l5UCQQDExqVFXV0XxKKQ\n'+
'WSBNuuZ/KIU3D2fZ+AN70n7qqN/sLM1TK+HhN/4Du9N3N6t3eXMQ1CBH5CttR7Kd\n'+
'AUNSCCjfAkEAszMIe8Zc/brAo7DDD6XCZ5LW6dUoU0QbM+FsEgokW3dSjFVUebf4\n'+
'Z8xZNutLDxMU9JPl+B7hWsTkyGRrhUuqUwJAUdbwe+X1xuHgXrrCxbFbFj3LEfhV\n'+
'UAFnqYMFiCFOaFLF3racjmgUPIdMzwOXS+x2H+SpvFy4dw3fyo7w6dg87wJAGbdg\n'+
'J0sfOzZawOL0C0HRdUWoW+RAJjrm4HogJTKZZxrnmMYCGnmhR1wXDX+UxPQLFNJI\n'+
'tWPRGVKaNnvaxkVGiwJBAJtYEcxaI6myXbVbMdQXxvH7WISV3KMyYqP8++BkkwCs\n'+
'O5jBcbKf9MjnneMnlvR6PBqruWt+BVUwujvUXcuPoiM=\n'+
'-----END RSA PRIVATE KEY-----');

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

//Process any topics/messages from the broker
client.on('message', function(topic, message)
{
	//Decrypt message recieved from the broker
	let decryptedMessage = key.decrypt(message);
	
	//If controller is requesting a response back, acknowledge
	if (topic == 'sub')
	{
		client.publish('ack', key.encrypt('ack'), function (err)
		{
			if (err) throw "Error Description: " + err;
		});	
	}
	//If controller is sending data, process data
	if (topic == 'data')
	{
		//Determine what the controller is sending for car control
		if (decryptedMessage == 'stop')
		{
			//Stop, stop all motors
			console.log("Recieved Stop")
			stop();
		}
		else if(decryptedMessage == 'foward')
		{
			//Foward, stop all motors
			console.log("Recieved Foward");
			stop();
			//Set motors to go foward
			rightFoward.pwmWrite(255);
			leftFoward.pwmWrite(255);
		}
		else if(decryptedMessage == 'reverse')
		{
			//Reverse, stop all motors
			console.log("Recieved Reverse")
			stop();
			//Set all motors to go in reverse
			rightReverse.pwmWrite(255);
			leftReverse.pwmWrite(255);
		}
		else if(decryptedMessage == 'right')
		{
			//Right, stop all motors
			console.log("Recieved Revers")
			stop();
			//Only spin the left motors to turn the PiCar right
			leftFoward.pwmWrite(150);
		}
		else if(decryptedMessage == 'left')
		{
			//Left, stop all motors
			console.log("Recieved Revers")
			stop();
			//Only spin the right motors to turn the PiCar left
			rightFoward.pwmWrite(150);
		}
		else if(decryptedMessage == 'exit')
		{
			//Exit, stop all motors
			console.log("Recieved Exit");
			stop();
			//Delete the GPIO motor controls
			delete rightReverse;
			delete leftFoward;
			//Exit Process
			process.exit(0);
		}
	}
});

//Function to stop all motors
function stop() {
	leftReverse.pwmWrite(0);
	rightFoward.pwmWrite(0);
	rightReverse.pwmWrite(0);
	leftFoward.pwmWrite(0);
}

//Kill process through ctrl+c
process.on('SIGINT', function()
{
	//Stop all motors
	stop();
	//Delete the GPIO motor controls
	delete rightReverse;
	delete leftFoward;
	//Exit process
	process.exit(0);
});
/*Name:		Alexander Wittman
* Project:  Final IoT Project
* Due Date:	12/09/2020
*/

//Packages required to recieve data from the broker
const mqtt = require('mqtt');
const NodeRSA = require('node-RSA');

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

//Allow input from the user
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.pause();

//Determine if the controller is connected to the Car
var isConnected = false;

//Credentials required to connect to the broker
const options = 
{
	port: '1883',
	host: '192.168.0.16',
	username: 'bucserve',
	password: 'E+$uBu($'
};

//Connect to the server using the credentials
const client = mqtt.connect(options);

//Connect to the broker and subscribe to 'data'
client.on('connect', function ()
{
	console.log("\nController connected to broker.\n")
	client.subscribe('ack', function (err)
	{
		if (err) throw "Error description: " + err;
	});
});

//Determines if the controller is still connected to the PiCar
async function connection()
{
	//First set connection to false
	isConnected = false;
	//Send a sub/ack request to the controller
	client.publish('sub', key.encrypt('sub'), function (err)
	{
		if (err) throw "Error Description: " + err;
	});
	
	//Wait 1 sec for a response
	await sleep(1000);
	
	//If no ack, disable all inputs to the controller
	if (isConnected == false)
	{
		process.stdin.pause();
		console.log("Awaiting Connection");
	}
};

//Require connection sub/ack every 10 seconds
setInterval (function()
{
	connection();
},10000);

//Recieve sub/ack from the PiCar
client.on('message', function(topic, message)
{
	if(topic == 'ack')
	{
		//Recieved ack from the PiCar, restore all inputs for the controller
		if(isConnected == false)
		{
			console.log("Connected");
		}
		isConnected = true;
		process.stdin.resume();
	}
});

//Send data to the broker based on user input
process.stdin.on('keypress', async function(keyPress, data) 
{
	if (data.name === 'w')
	{
		//Send encrypted foward to the PiCar
		client.publish('data', key.encrypt('foward'), function (err)
        {
			console.log("Sending Foward");
            if (err) throw "Error Description: " + err;
        });
	}
	else if (data.name === 'space')
	{
		//Send encrypted stop to the PiCar
		client.publish('data', key.encrypt('stop'), function (err)
        {
			console.log("Sending Stop");
            if (err) throw "Error Description: " + err;
        });
	}
	else if (data.name === 's') 
	{
		//Send encrypted reverse to the PiCar
		client.publish('data', key.encrypt('reverse'), function (err)
        {
			console.log("Sending Reverse");
            if (err) throw "Error Description: " + err;
        });
	}
	else if (data.name === 'a') 
	{
		//Send encrypted left to the PiCar
		client.publish('data', key.encrypt('left'), function (err)
        {
			console.log("Sending Left");
            if (err) throw "Error Description: " + err;
        });
	}
	else if (data.name === 'd') 
	{
		//Send encrypted right to the PiCar
		client.publish('data', key.encrypt('right'), function (err)
        {
			console.log("Sending Right");
            if (err) throw "Error Description: " + err;
        });
	}
	else if (data.ctrl && data.name === 't')
	{
		//Send encrypted exit to the PiCar
		client.publish('data', key.encrypt('exit'), async function (err)
		{
			console.log("Sending Exit");
			if (err) throw "Error Description: " + err;
		});
		//Close out controller after the PiCar has been exited
		console.log("Exiting");
		await sleep(1000)
		process.exit();
	}
});

//Sleep function to allow time between publishing
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
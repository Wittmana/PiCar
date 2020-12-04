/*Name:		Alexander Wittman
* Project:  Final IoT Project
* Due Date:	12/09/2020
*/

//Packages required to recieve data from the broker
const mqtt = require('mqtt');

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

async function connection()
{
	isConnected = false;
	client.publish("sub", "", function (err)
	{
		if (err) throw "Error Description: " + err;
	});
	
	await sleep(1000);
	
	if (isConnected == false)
	{
		process.stdin.pause();
		console.log("Awaiting Connection");
	}
};

setInterval (function()
{
	connection();
},10000);

client.on('message', function(topic, message)
{
	if(topic == 'ack')
	{
		if(isConnected == false)
		{
			console.log("Connected");
		}
		isConnected = true;
		process.stdin.resume();
	}
});

//Send data to the broker based on user input
process.stdin.on('keypress', async function(key, data) 
{
	if (data.name === 'w')
	{
		client.publish("data", "foward", function (err)
        {
			console.log("Sending W");
            if (err) throw "Error Description: " + err;
        });
	}
	else if (data.name === 'space')
	{
		client.publish("data", "stop", function (err)
        {
			console.log("Sending Stop");
            if (err) throw "Error Description: " + err;
        });
	}
	else if (data.name === 's') 
	{
		client.publish("data", "reverse", function (err)
        {
			console.log("Sending S");
            if (err) throw "Error Description: " + err;
        });
	}
	else if (data.name === 'a') 
	{
		client.publish("data", "left", function (err)
        {
			console.log("Sending R");
            if (err) throw "Error Description: " + err;
        });
	}
	else if (data.name === 'd') 
	{
		client.publish("data", "right", function (err)
        {
			console.log("Sending D");
            if (err) throw "Error Description: " + err;
        });
	}
	else if (data.ctrl && data.name === 't')
	{
		client.publish("data", "exit", async function (err)
		{
			console.log("Sending Exit");
			if (err) throw "Error Description: " + err;
		});
		console.log("Exiting");
		await sleep(1000)
		process.exit();
	}
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
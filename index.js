var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var entries = [];
var usernames = ['John','Doe','Appleseed','Bill Gates','Steve Jobs','Steve Balmer','Jony Ive','Barack Obama'];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('someone connected.');
	var currentUser;

	socket.emit('usernames', usernames);
	socket.emit('entries', entries);

	socket.on('login', function(username){
		for (i = 0; i < usernames.length; i++) {
			if (usernames[i] == username) {
				currentUser = username;
				console.log('someone logged in.');
			}
		}
	});

	socket.on('add-entry', function(entry){
		if (!currentUser)
			return;

		entry.id = entries.length;
		entry.author = currentUser;
		entry.votes = [];
		entries[entry.id] = entry;
		broadcastUpdate();
		console.log('someone added a entry.');
	});
	socket.on('vote', function(entryId){
		if (!currentUser)
			return;

		var entry = entries[entryId];
		for (i = 0; i < entry.votes.length; i++) {
			if (entry.votes[i] == currentUser)
				return;
		}
		entry.votes[entry.votes.length] = currentUser;
		broadcastUpdate();
		console.log('someone voted.');
	});

});

function broadcastUpdate() {
	io.emit('entries', entries);
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});

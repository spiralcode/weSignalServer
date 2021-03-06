const app = require('express')();
const http = require('http').Server(app);
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

var userList = [];
app.get('/clearUsers', (req, res) => {
    userList.splice(0, userList.length);
    res.send('Cleared');
});
app.get('/listUsers', (req, res) => {
    res.send(JSON.stringify(userList));
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frame.html');
});
io.on('connection', (socket) => {
    console.log('a user is connected');
    socket.on('register', (msg) => {
        let user = new Object;
        user.id = msg;
        user.socketid = socket.id;
        userList.push(user);
    });
    socket.on('request', (recipient) => {
        for (var i = 0; i < userList.length; i++) {
            if (userList[i].id == recipient.id) {
                let package = new Object();
                package.src = socket.id;
                package.offer = recipient.offer;
                package.myID = myID(socket);
                console.log(package.myID);
                io.to(userList[i].socketid).emit('offer', package);
            }
        }
    });
    socket.on('answer', (package) => {
        package.src = socket.id;
        package.answer = package.answer;
        io.to(package.recipient).emit('answer', package);
    });
    socket.on('ice-candidate', (incpackage) => {
        for (var i = 0; i < userList.length; i++) {
            if (userList[i].id == incpackage.recID) {
                let package = new Object();
                package.src = userList[i].id;
                package.candidate = incpackage.candidate;
                io.to(userList[i].socketid).emit('ice-candidate', package);
            }
        }
    });
    const myID=(socket)=>{
        console.log('called');
        for(var i=0;i<userList.length;i++)
        {
            if(userList[i].socketid==socket.id)
            {
                return userList[i].id;
            }
        }
    }
  
});

http.listen(PORT, () => {
    console.log('Listening on ' + PORT);
});
const express = require("express"),
    path = require("path"),
    app = express(),
    PORT = 8000;

let users=[];
//View and Static
app.use(express.static(path.join(__dirname, "./static")));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

//Routes
app.get('/',function(req,res){
    res.render("index");
})

//Node server and socket
var server = app.listen(PORT, function () {
    console.log(`listening on port ${PORT}`);
})
var io = require('socket.io').listen(server);

io.sockets.on('connection',function(socket){
    //Emit current users...needed?
    console.log("Client's ID:",socket.id)

    //LISTEN for new_user
    socket.on("new_user",function(data){
        let user = { name: data.name, id: socket.id }
        users.push(user)
        //Uni EMIT array and client EMIT save socket.id
        socket.emit('login',{_id:socket.id})
        io.emit('existing_users',{users:users})
        io.emit('joined', { name: user.name })
    })
    //LISTEN disconnect
    socket.on("disconnect", function(data) {
        for(let i=0;i<users.length;i++){
            if(users[i].id === socket.id){
                var dis_user = users[i]
                users.splice(i, 1);
                io.emit('disconnected_user', { user: dis_user })
                return;
            }
        }
        console.log("User not in server-side array for some reason...")
    })
    //LISTEN Message sent
    socket.on('sent',(data)=>{
        let message_received = `${data.name}: ${data.message}`
        io.emit('received', { message_received:message_received})
    })


})
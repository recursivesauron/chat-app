const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

//Setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket Connection')

    socket.on('join', ({username, room}, callback) => {
        const { error, user} = addUser({id: socket.id, room, username})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Server', 'Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage('Server', `${user.username} has joined the channel`))
        //socket.emit, io.emit, socket.broadcast.emit
        //io.to.emit, socket.broadcast.to.emit
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('Delivered!')
    })

    socket.on('sendLocation', (locationInfo, callback) => {
        const user = getUser(socket.id)
        const locationMessage = generateLocationMessage(user.username, 'https://google.com/maps?q=' + locationInfo.latitude + "," + locationInfo.longitude)
        io.to(user.room).emit('locationMessage', locationMessage)
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message', generateMessage('Server', `${user.username} has left the chat`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log("server is up on port: " + port)
})
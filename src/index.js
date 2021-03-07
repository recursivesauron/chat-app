const path = require('path')
const http = require('http')
const hbs = require('hbs')
const express = require('express')
const socketio = require('socket.io')
const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

//Setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

//Setup static directory to serve
app.use(express.static(publicDirPath));
app.use(express.json())

app.get('', async (req, res) => {
    res.render('index', {
        text: 'Chat app'
    })
})

// let count = 0

io.on('connection', (socket) => {
    console.log('New WebSocket Connection')
    socket.emit('message', 'Welcome!')

    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('sendMessage', (message, callback) => {
        io.emit('message', message)
        callback('Delivered!')
    })

    socket.on('sendLocation', (locationInfo, callback) => {
        io.emit('message', 'https://google.com/maps?q=' + locationInfo.latitude + "," + locationInfo.longitude)
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat')
    })
})

server.listen(port, () => {
    console.log("server is up on port: " + port)
})
const socket = io()

socket.on('message', (message) => {
    console.log(message)
})

const messageForm = document.querySelector('form')
messageForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const message = messageForm.elements.message
    socket.emit('sendMessage', message)
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
    })
})
const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')

socket.on('message', (message) => {
    console.log(message)
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = $messageForm.elements.message.value
    socket.emit('sendMessage', message, (ackMessage) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log('The message was delivered:', ackMessage)
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const locationInfo = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        
        socket.emit('sendLocation', locationInfo, (ackError) => {
            $locationButton.removeAttribute('disabled')
            if(ackError){
                return console.log(ackError)
            }
            
            console.log('Location shared!')
        })
    })
})
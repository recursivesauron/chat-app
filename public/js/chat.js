const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight
    
    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight

    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (locationMessage) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: locationMessage.username,
        locationURL: locationMessage.locationURL,
        createdAt: moment(locationMessage.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
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

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href='/'
    }
})
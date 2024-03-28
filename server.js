import path from 'path'
import http from 'http'
import express from 'express'
import {
  Server
} from 'socket.io'
import {formatMessage} from './utils/messages.js'
import * as chatHelpers from './utils/users.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new Server(server)

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'SimpleChat Bot'

// Run when client connects
io.on('connection', socket => {
  console.log(io.of('/').adapter)

  socket.on('joinRoom', ({
    username,
    room
  }) => {
    const user = chatHelpers.userJoin(socket.id, username, room)

    socket.join(user.room)

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to SimpleChat!'))

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      )

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: chatHelpers.getRoomUsers(user.room),
    })
  })

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = chatHelpers.getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = chatHelpers.userLeave(socket.id)

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      )

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: chatHelpers.getRoomUsers(user.room),
      })
    }
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

import path from 'path'
import http from 'http'
import express from 'express'
import {
  Server
} from 'socket.io'
import {formatMessage} from './utils/messages.js'
import * as chatHelpers from './utils/users.js'
import { fileURLToPath } from 'url'

// Set static folder
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static(path.join(__dirname, 'public')))

const BOT_NAME = 'SimpleChat Bot'

// Run when client connects
io.on('connection', socket => {
  // asking the server to show you the details of that internal mechanism, which is usually helpful for debugging purposes during development.
  console.log(io.of('/').adapter)

  socket.on('joinRoom', ({
    username,
    room
  }) => {
    const user = chatHelpers.userJoin(socket.id, username, room)

    // this function allows a client to join a specific chat room. Rooms are a way to group clients for targeted messaging.
    socket.join(user.room)

    // Welcome current user
    socket.emit('message', formatMessage(BOT_NAME, 'Welcome to SimpleChat!'))

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(BOT_NAME, `${user.username} has joined the chat`)
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
        formatMessage(BOT_NAME, `${user.username} has left the chat`)
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

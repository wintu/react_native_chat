const io = require('socket.io')(8080)

const users = []
const messages = []

io.sockets.on('connection', socket => {
  socket.on('user', (name, cb) => {
    console.log(`UserJoin: ${name}`)
    let user = users.find(user => user.name === name)
    if (!user) {
      user = {
        _id: users.length + 1,
        name
      }
      users.push(user)
    }
    cb({user, messages: messages.slice().reverse()})
  })

  socket.on('message', data => {
    console.dir(data)
    messages.push(data)
    io.sockets.emit('message', data)
  })
})
console.log('SocketIO 8080')

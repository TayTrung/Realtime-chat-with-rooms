const app = require('express')();
const server = require('http').createServer(app);
const {
  addUser,
  removeUser,
  getAllUsersInRoom,
  getUser,
} = require('./model/User');
const io = require('socket.io')(server);
const router = require('./routes/User');

const PORT = process.env.PORT || 5000;

app.use('/', router);

// app.get('/', (req, res) => {
//   res.send('<h1>Hello world</h1>');
// });

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.emit('message', {
      user: 'admin',
      text: `Welcome to the room ${user.room}, ${user.name}`,
    });

    socket.to(user.room).emit('message', {
      user: 'admin',
      text: `User ${user.name} has joined ${user.name}!`,
    });

    socket.join(user.room);

    io.in(user.room).emit('getUsers', getAllUsersInRoom(user.room));
  });

  socket.on('userSendMsg', (msg, callback) => {
    const user = getUser(socket.id);

    io.in(user.room).emit('message', { user: user.name, text: msg });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.in(user.room).emit('message', {
        user: 'admin',
        text: `User ${user.name} left the chat!`,
      });
      io.in(user.room).emit('getUsers', getAllUsersInRoom(user.room));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

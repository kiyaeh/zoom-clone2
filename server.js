const express = require("express");
const app = express();

// if you want to create a server to handle HTTP requests, you need to use the built-in http module.
const server = require("http").Server(app);

// With socket.io, you can build real-time features such as chat applications, live updates, collaborative editing, and more, making your web application more interactive and responsive.(joining backend with the frontend)
const io = require("socket.io")(server);

// //importing peer
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true });

// ///will genererate new numberss/ids////////
const { v4: uuidV4 } = require("uuid");

// //// we have to tell the browser what kind of file its gonna read///
app.set("view engine", "ejs");

// This line sets up Express to serve static files (e.g., CSS, JavaScript, images) from the "public" folder.
app.use(express.static("public"));

// ///in every request of peer.js run peerServer///
app.use("/peerjs", peerServer);

// When a user visits the root URL "/", the server will redirect them to a new unique URL that includes a version 4 UUID as the room ID.
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

// ///everytime it get  a parameter(declared it rooM) after the /..render the room.ejs page,then pass me the rooM(the url after the /) as z variable roomId..moreover,When a user accesses a URL with a specific room ID, such as "/room123", the server will render the room.ejs template, passing the room ID(the one generated in line 28) as the variable roomId.
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    // console.log("New user connected!", roomId);
    io.emit("broadcast", "Hello, everyone!");
    socket.to(roomId).emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("disconnect", () => {
      io.emit("broadcast", "bye, everyone!");
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log("Server is running on port 4000");
});

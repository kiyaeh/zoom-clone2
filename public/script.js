// /importing socket(joining backend with the frontend)
const socket = io("/");
const peers = {};

const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "4000",
});

// /accessing  z div from the html page(ejs page)
const videoGrid = document.getElementById("video-grid");

// This line creates a new <video> element using the document.createElement() method. This element will be used to display the user's video stream.
const myVideo = document.createElement("video");

// This line declares a variable myVideoStream without initializing it. This variable will store the user's video stream once it's obtained from navigator.mediaDevices.getUserMedia().
let myVideoStream;

// This line sets the muted property of the <video> element to true. By doing this, the user's own video stream will be muted when displayed in the element.
myVideo.muted = true;

// //gets the users media which is the video and audio(promots the user nfro permission to use media inputs,returns a promise)

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    let text = $("input");
    $("html").keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });
    socket.on("createMessage", (message) => {
      $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
    });
  })
  .catch((error) => {
    // Handle errors (e.g., user denies permission)
    console.error("Error accessing media devices:", error);
  });

//  /////takes video(created elment byy myVideo) and stream...
function addVideoStream(video, stream) {
  // /for video there is a src tag just like image tag called srcobject(so as a src take the stream)
  video.srcObject = stream;

  // ////loadedmetadata (occurs when metadata fro a specified audio /video loads automatically)
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  // the <video> element is appended to the "videoGrid"(const videoGrid = document.getElementById("video-grid") in line 2) container in the HTML
  videoGrid.append(video);
}

////peer generates id for all the users
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

// //when another user is connected we are adding the video to the main room
function connectToNewUser(userId, stream) {
  // console.log("bini front", userId);
  const call = myPeer.call(userId, stream);
  // newly created video element///
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
}
// ///////////////////////////////////////////
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i><span>Stop Video</span>`;
  document.querySelector(".main_video_button").innerHTML = html;
};
const setPlayVideo = () => {
  const html = `<i class="fas fa-video-slash"></i><span>Play Video</span>`;
  document.querySelector(".main_video_button").innerHTML = html;
};
// ////////////////////////////////

// //////////////////////
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i><span>Mute</span>`;
  document.querySelector(".main_mute_button").innerHTML = html;
};
const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>`;
  document.querySelector(".main_mute_button").innerHTML = html;
};
////////////////////////////////////

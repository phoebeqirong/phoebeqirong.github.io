"use strict";

// LOCAL PLAYER

var played_songs = [];

function player_click(player) {
  const audio_id = player.id.replace("_player", "_audio");
  var audio = document.getElementById(audio_id);
  if (audio.paused) {
    audio.play();
    return;
  }
  audio.pause();
}

function audio_timeupdate(audio) {
  var time = Math.round(audio.currentTime);
  var minutes = Math.floor(time / 60);
  var seconds = (time - minutes * 60).toString().padStart(2, "0");
  const time_slot_id = event.target.id.replace("_audio", "_time");
  var time_slot = document.getElementById(time_slot_id);
  time_slot.innerText = minutes + ":" + seconds;
}

function local_player_play(player_id) {
  var player = document.getElementById(player_id);
  player.innerText = "⏸️";
  player.classList.remove("song__player--start");
  player.classList.add("song__player--pause");
}

function local_player_pause(player_id) {
  var player = document.getElementById(player_id);
  player.innerText = "▶️";
  player.classList.remove("song__player--pause");
  player.classList.add("song__player--start");
}

// GLOBAL PLAYER
function global_player_control_click(control) {
  var player = document.querySelector(".player");
  const audio_id = player.dataset.song + "_audio";
  var audio = document.getElementById(audio_id);
  if (audio.paused) {
    audio.play();
    return;
  }
  audio.pause();
}

function play_random_song() {
  const all_audios = document.querySelectorAll(".song__audio ");
  const random_audio = all_audios[(all_audios.length * Math.random()) | 0];
  if (played_songs.includes(random_audio.id)) {
    play_random_song();
  } else {
    random_audio.play();
    played_songs.push(random_audio.id);
  }
}

function play_next_song(current_song_id) {
  const year = parseInt(current_song_id.split("_")[1]);
  const song_index = parseInt(current_song_id.split("_")[2]);
  // First, try next song.
  var audio = document.getElementById(
    "song_" + year + "_" + (song_index + 1) + "_audio"
  );
  if (audio) {
    audio.play();
    played_songs.push(audio.id);
    return;
  }
  // Then, try the song after.
  audio = document.getElementById(
    "song_" + year + "_" + (song_index + 2) + "_audio"
  );
  if (audio) {
    audio.play();
    played_songs.push(audio.id);
    return;
  }
  // Finally, try previous year.
  audio = document.getElementById("song_" + (year - 1) + "_1_audio");
  if (audio) {
    audio.play();
    played_songs.push(audio.id);
  }
}

function global_player_play(song_id) {
  var song = document.getElementById(song_id);
  var player = document.querySelector(".player");
  player.classList.remove("player--hidden");
  player.dataset.song = song_id;
  var year = document.querySelector(".player__year");
  year.innerText = song.dataset.year;
  var link = document.querySelector(".player__link");
  var label = [
    song.querySelector(".song__info--title").innerText,
    song.querySelector(".song__info--artists").innerText,
  ].join(" - ");
  document.title = label;
  link.innerText = label;
  link.href = "#" + song_id;
  var control = document.querySelector(".player__control");
  console.log(control.classList);
  control.classList.remove("player__control--start");
  control.classList.add("player__control--pause");
  control.innerText = "⏸️";
}

function global_player_pause(song_id) {
  var control = document.querySelector(".player__control");
  control.setAttribute("class", "player__control player__control--start");
  control.classList.remove("player__control--pause");
  control.classList.add("player__control--start");
  control.innerText = "▶️";
}

// EVENTS

// On audio play, pause the other songs and change player icon.
document.addEventListener(
  "play",
  function (event) {
    var audios = document.getElementsByTagName("audio");
    for (var audio of audios) {
      if (audio != event.target) {
        audio.pause();
      }
    }
    const player_id = event.target.id.replace("_audio", "_player");
    local_player_play(player_id);
    const song_id = event.target.id.replace("_audio", "");
    var song = document.getElementById(song_id);
    song.classList.add("song--playing");
    global_player_play(song_id);
  },
  true
);

// On audio pause, change player icon.
document.addEventListener(
  "pause",
  function (event) {
    const player_id = event.target.id.replace("_audio", "_player");
    local_player_pause(player_id);
    const song_id = event.target.id.replace("_audio", "");
    var song = document.getElementById(song_id);
    song.classList.remove("song--playing");
    global_player_pause(song_id);
  },
  true
);

// On audio end, play a random song.
document.addEventListener(
  "ended",
  function (event) {
    if (document.getElementsByClassName("player__mode--random").length > 0) {
      play_random_song();
    } else {
      const current_song_id = event.target.id;
      play_next_song(current_song_id);
    }
  },
  true
);

// Add players interactions.
window.addEventListener(
  "load",
  function (event) {
    var player_mode = document.querySelector(".player__mode");
    player_mode.addEventListener(
      "click",
      function (event) {
        event.target.classList.toggle("player__mode--random");
        if (event.target.innerText == "Rand") {
          event.target.innerText = "Seq";
        } else {
          event.target.innerText = "Rand";
        }
      },
      true
    );
    var global_player = document.querySelector(".player__control");
    global_player.addEventListener(
      "click",
      function (event) {
        global_player_control_click(event.target);
      },
      true
    );
    var global_player = document.querySelector(".player__next");
    global_player.addEventListener(
      "click",
      function (event) {
        if (
          document.getElementsByClassName("player__mode--random").length > 0
        ) {
          play_random_song();
        } else {
          const current_song_id = event.target.closest(".player").dataset.song;
          play_next_song(current_song_id);
        }
      },
      true
    );
    var players = document.querySelectorAll(".song__player");
    [].forEach.call(players, function (player) {
      player.addEventListener(
        "click",
        function (event) {
          player_click(event.target);
        },
        true
      );
    });
    var audios = document.querySelectorAll("audio");
    [].forEach.call(audios, function (audio) {
      audio.addEventListener(
        "timeupdate",
        function (event) {
          audio_timeupdate(event.target);
        },
        true
      );
    });
  },
  true
);

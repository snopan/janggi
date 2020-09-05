import Vue from "vue";
import Vuex from "vuex";
import Cookies from "js-cookie";

import HomeScreen from "./modules/HomeScreen";
import WaitScreen from "./modules/WaitScreen";
import GameScreen from "./modules/GameScreen/module";
import config from "../../config.json";

Vue.use(Vuex);

// Start ws connection to the server
const socket = new WebSocket("wss://" +
	config.ws.address +":" +
	config.ws.port
);

socket.onopen = () => {
	console.log("Connection established!")
    store.dispatch("sendPacket", {
        type: "session",
        id: Cookies.get("session_id")
    })
};

// Incoming message gets parsed to store action
socket.onmessage = (msg) => {
    store.dispatch("parseMessage", JSON.parse(msg.data));
};

export const store = new Vuex.Store({
    state: {
        screen: "home",
        alerts: []
    },
    actions: {
        listenResize: ({ state, commit }) => {
            // Function listens for window resizing
            // called when app is created

            // Any further changes to window size
            // will also call for an update
            window.addEventListener(
                "resize",
                // Only update values if on game screen
                () => {
                    if (state.screen === "game")
                        commit("updateGameResize");
                }
            );
        },

        // Websocket actions
        sendPacket: (state, packet) => {
            socket.send(JSON.stringify(packet));
        },
        parseMessage : ({ state, commit, dispatch }, msg) => {
            switch (msg.type) {
                case "validate":

                    // Set a session id for site that last till expire
                    Cookies.set("session_id", msg.session_id, { expires: config.session_expire })

                    // Send for join request with the given room
                    // code in link after connection with websocket
                    var hash = window.location.hash;
                    if (hash && hash.length === 7) {
                        dispatch("joinRoom", hash.slice(1,))
                    }
                    break;
                case "connected_rooms":
                    commit("setRooms", msg.rooms);
                    break;
                case "wait_room":

                    // Set details and change screen to wait
                    commit("resetWaitScreen");
                    commit("setWaitScreen", {
                        private_room: msg.private_room,
                        room_id: msg.room_id
                    });
                    commit("changeScreen", "wait");
                    break;
                case "join_error":
                    commit("setJoining", false)
                    commit("addAlert", {
                        type: "danger",
                        message: msg.message
                    })
                    break;
                case "setup_game":
                    commit("resetGameScreen");

                    // Do an initial update for game size
                    commit("updateGameResize")
                    commit("setGameScreen", {
                        pieces: msg.pieces,
                        color: msg.color,
                        spectator_color: msg.spectator_color
                    })
                    if (msg.checked_color)
                        commit("setCheck", {
                            color: msg.checked_color,
                            checked_moves: msg.checked_moves
                        });
                    commit("changeScreen", "game")
                    break;
                case "start_prep":
                    commit("setPreparation", true);
                    break;
                case "prep_status":
                    commit("setReady", msg.status);
                    break;
                case "swap_piece":
                    commit("setSwap", {
                        side: msg.side,
                        wait: false
                    });
                    commit("swapPiece", {
                        side: msg.side,
                        side_color: msg.color
                    });
                    break;
                case "end_prepare":
                    commit("setPreparation", false);
                    break;
                case "next_turn":
                    commit("nextTurn", msg.turn);
                    break;
                case "execute_move":
                    commit("executeMove", {
                        color: msg.color,
                        from: msg.from,
                        to: msg.to
                    })
                    break;
                case "in_check":
                    commit("setCheck", {
                        checked_color: msg.checked_color,
                        checked_moves: msg.checked_moves
                    });
                    break;
                case "check_position":
                    commit("setPositionChecking", msg.position);
                    break;
                case "game_finish":
                    commit("setWinner", msg.winner);
                    break;
                case "room_close":

                    // When user leaves wait screen
                    // immediately move back to home
                    if (state.screen === "wait") {
                        commit("resetHomeScreen");
                        commit("changeScreen", "home");
                    }

                    // When user leaves game, let user
                    // know for a bit before moving
                    // back to home
                    else if (state.screen === "game") {
                        commit("addAlert", {
                            type: "warning",
                            message: "Room is closing, returning to home in 5 seconds"
                        });
                        setTimeout(() => {
                            commit("resetHomeScreen");
                            commit("changeScreen", "home");
                        }, 5000);
                    }
                    break;
                case "replace_player":
                    commit("addAlert", {
                        type: "warning",
                        message: "Another connection has started on this player, returning to home in 5 seconds"
                    });
                    setTimeout(() => {
                        commit("resetHomeScreen");
                        commit("changeScreen", "home");
                    }, 5000);
                    break;
                case "left_room":
                    // When spectator decides to leave
                    // immediately go back to home
                    commit("resetHomeScreen");
                    commit("changeScreen", "home");
                    break;
                case "error":
                    commit("addAlert", {
                        type: "danger",
                        message: msg.message
                    });
                    break;
            }
        }
    },
    mutations: {
        changeScreen: (state, screen) => {
            state.screen = screen;
        },
        addAlert: (state, { type, message }) => {
            state.alerts.push({ type, message });
        }
    },
    modules: {
        HomeScreen,
        WaitScreen,
        GameScreen
    }

})
import WebSocket from "ws";
import Crypto from "crypto";
import Session from "./Session.js";
import Room from "./Room.js";
import config from "./config.json";

const wss = new WebSocket.Server({
    port: 9080
});

wss.on("connection", (ws, req) => {
    console.log("connection established")
    ws.ip = req.connection.remoteAddress;
    ws.id = Crypto.randomBytes(20).toString("hex");

    // Keep socket values that determine
    // what socket can do
    ws.session_id = false;
    ws.room_id = false;

    // Set sending message function
    ws.sendMessage = (msg) => {
        console.log("sending", msg)
        ws.send(JSON.stringify(msg));
    }

    // Timer to get session id validation
    ws.wait_for_info = setTimeout(() => {

        // Let the user know they have timed out
        ws.sendMessage({
            type: "validation_timeout"
        })

        // End the connection if no info has
        // been given within the set time
        ws.wait_for_info = false;
        ws.close();
        console.log(ws.ip + " has timed out")
    }, config.session_validate_wait * 1000) // config values
                                                        // are in sec
    // Passing incoming packet content to parser
    ws.on("message", (msg) => {
        console.log("received", JSON.parse(msg));
        parseMessage(ws, JSON.parse(msg));
    })

    ws.on("close", () => {
        if (ws.room_id) {
            let room = Room.getRoom(ws.room_id);
            room.leaveRoom(ws);
        }
    })
})

const parseMessage = (ws, msg) => {

    // When user hasn't validated their session
    if (ws.wait_for_info) startupMessageParser(ws, msg);

    // When user is not in a room
    else if (!ws.room_id) homeMessageParser(ws, msg);

    // When user is in a room
    else roomMessageParser(ws, msg);
}

// When websocket just connected, all
// messages should be routed here until
// a session validation is requested
const startupMessageParser = (ws, msg) => {
    if (msg.type == "session") {

        // Stop the countdown as validation is requested
        clearTimeout(ws.wait_for_info);
        ws.wait_for_info = false;

        let session;

        // Check if session id is valid
        // else create a new session
        if (Session.validateSession(msg.id, ws.ip))
            session = Session.getSession(msg.id)
        else session = new Session(ws.ip);

        // Keep an id to session
        ws.session_id = session.id;

        // Send the validation back to client
        ws.sendMessage({
            type: "validate",
            session_id: session.id
        })

        sendRoomList(ws);
    }
}

// When the player is not in a room
// all messages is routed here until
// player decides to join one
const homeMessageParser = (ws, msg) => {
    let room;
    switch (msg.type) {
        case "quick_join":
            room = Room.VacantPublicRoom(ws.session_id);

            // When there's a vacant room
            if (room) {
                room.joinRoom(ws, ws.session_id);
            }

            // When there's no available room, tell
            // user to wait in a newly created room
            else {
                room = new Room(false);
                room.joinRoom(ws);

                // Tell the user to wait
                ws.sendMessage({
                    type: "wait_room",
                    private_room: false,
                    room_id: room.id
                })
            }

            break;
        case "join_room":
            room = Room.getRoom(msg.id);

            // When room exist
            if (room) {
                room.joinRoom(ws, ws.session_id)
            }

            // When room does't exist
            // let user know join failed
            else {
                ws.sendMessage({
                    type: "join_error",
                    message: "Room does not exist"
                })

                // Put an update on the rooms this
                // session is connected to
                sendRoomList(ws, ws.session_id);
            }
            break;
        case "create_room":
            room = new Room(true);
            room.joinRoom(ws, ws.session_id);

            // Tell the user to wait
            // in the created room
            ws.sendMessage({
                type: "wait_room",
                private_room: true,
                room_id: room.id
            })
            break;
    }
}

const roomMessageParser = (ws, msg) => {

    // Retrieve the room user is in
    let room = Room.getRoom(ws.room_id);

    switch(msg.type) {
        case "leave_room":
            room.leaveRoom(ws);
            sendRoomList(ws);
            break;
        case "restart_ready":
            room.readyRestart(ws.session_id);
            break;
        case "prepare_ready":
        case "swap_piece":
        case "move_piece":
            gameMessageParser(room, ws, msg);
            break;
    }
}

const gameMessageParser = (room, ws, msg) => {

    // Retrieve the game user is in
    let game = room.game;

    // Stop parsing when game is finished or
    // if the user isn't a player of a game (spectator)
    if (game.finished || !room.isSeshIn(ws.session_id))
        return 0;

    switch(msg.type) {
        case "prepare_ready":
            if (game.preparing) {
                game.setReadyPrep(ws.session_id);
            }
            break;
        case "swap_piece":

            // When the game is in preparation phase and
            // the player has not said they're ready,
            // the swap also has to be a valid side
            if (game.preparing && !game.preparing[ws.session_id] &&
                (msg.side === "L" || msg.side === "R"))
                game.swapPiece(ws.session_id, msg.side);

            else
                ws.sendMessage({
                    type: "error",
                    message: "Unable to swap pieces"
                });
            break;
        case "move_piece":
            if (game.canMove(ws.session_id, msg.from, msg.to) && !game.preparing) {
                game.movePiece(msg.from, msg.to);
                if (game.killedKing(ws.session_id)) {
                    room.waitRestart();
                    game.announceFinish(ws.session_id);

                    // End the parsing, game will finish
                    return 0;
                }

                if (game.inCheck(ws.session_id)) {

                    // When the player made a move that is putting
                    // the other player in check, see if it's checkmate
                    if (game.inCheckmate) {
                        room.waitRestart();
                        game.announceFinish(ws.session_id);

                        // End the parsing, game will finish
                        return 0;
                    }

                    // If there are still moves to get out of check
                    // then just let the player know it's in check
                    else
                        game.announceCheck()
                }
                game.nextTurn();
            }
            else
                ws.sendMessage({
                    type: "error",
                    message: "Unable to execute this move"
                });
            break;
        case "restart_ready":
            break;
    }
}

// Should be sent whenever the user's action
// leads them back to the home screen to give
// user an update on what rooms they're in
const sendRoomList = (ws) => {
    let session = Session.getSession(ws.session_id)
    ws.sendMessage({
        type: "connected_rooms",
        rooms: session.rooms
    })
}
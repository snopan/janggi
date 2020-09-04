import Crypto from "crypto";
import Session from "./Session.js";
import Game from "./Game.js";
import config from "./config.json";

export default class Room {
    static ROOMS = {};

    constructor(private_room) {

        // Generate room id and set room privacy
        this.id = Crypto.randomBytes(3)
                    .toString("hex")
                    .toUpperCase();
        this.private_room = private_room;
        this.game = false;
        this.restart = false;

        // Keep details on what websocket the session
        // id holds that is currently connected as a player
        // key: session_id, value: websocket
        this.player_sockets = {};

        // When a player has left the room
        // if they dont come back after
        // a given amount of time, the
        // room should be closed
        this.left_room_timeout = false;

        // List of websocket that
        // are spectators they
        // are key by their ws id
        this.spectators = {};

        Room.ROOMS[this.id] = this;
    }

    isSeshIn(session_id) {
        return session_id in this.player_sockets;
    }

    // Check if all players are so
    // game can be started
    canStartGame() {
        return Object.keys(this.player_sockets).length == 2;
    }

    canRestartGame() {
        if (this.restart)
            return Object.values(this.restart).every((elem) => {return elem})
        else
            return false;
    }

    // Changes restart to an object that keeps
    // a record of who's ready for restart
    waitRestart() {
        this.restart = {}
        Object.keys(this.player_sockets).map( (session_id) => {
            this.restart[session_id] = false;
        })
    }

    // Broadcast a message packet to all
    // players and spectators
    broadcastMessage(msg) {

        // Tell all players the message
        for (let p_socket of Object.values(this.player_sockets)) {
            p_socket.sendMessage(msg);
        }

        // Tell all spectators the message
        Object.values(this.spectators).map( (s) => {
            s.sendMessage(msg);
        })
    }

    startGame() {

        // Make a new game
        this.game = new Game(
            this.id,
            Object.keys(this.player_sockets)[0],
            Object.keys(this.player_sockets)[1]
        );

        // Tell all players in the room to setup the board
        for (let p_sesh in this.player_sockets) {
            let socket = this.player_sockets[p_sesh];
            socket.sendMessage(this.game.playerInfo(p_sesh));
        }

        // Tell all spectators to setup the board
        Object.values(this.spectators).map( (s) => {
            s.sendMessage(this.game.spectatorInfo);
        })

        // Tell everyone that it's preparation phase
        this.broadcastMessage({ type: "start_prep" })
    }

    // When a socket is joining the room
    // situations:
    // - user joins room as the creator (first player)
    // - user joins the room as second player
    // - user joins even though he is in, on another window
    // - user rejoins when he has left before
    // - user joins as the spectator
    joinRoom(ws) {

        // When then game hasn't started
        if (!this.game) {

            // Check to see if the session is already
            // in, only one player slot per session
            if (!(ws.session_id in this.player_sockets)) {

                // Add the new player
                this.player_sockets[ws.session_id] = ws;
                ws.room_id = this.id;

                // Add room to session as this
                // is player that can reconnect
                Session.getSession(ws.session_id)
                    .addRoom(this.id);

                // Check if all players are full
                // and can start game
                if (this.canStartGame())
                    this.startGame();
            }
            else ws.sendMessage({
                type: "join_error",
                message: "Already in the room"
            })
        }

        // When the game has started
        else {

            // Check if session is already a player
            if (ws.session_id in this.player_sockets) {

                // When a socket is already connected
                // let the socket know it's getting replaced
                let socket = this.player_sockets[ws.session_id];
                if (socket) {
                    socket.room_id = false;
                    socket.sendMessage({type: "replace_player"})
                }

                // When the player has left, and this
                // is a reconnect to game
                else {
                    clearTimeout(this.left_room_timeout);
                    this.left_room_timeout = false;
                }

                // Set the socket to be in the room
                this.player_sockets[ws.session_id] = ws;

                // Send player info of game
                ws.sendMessage(this.game.playerInfo(ws.session_id));

                // Send the status of preparation of the player
                if (this.game.preparing)
                    ws.sendMessage({
                        type: "prep_status",
                        status: this.game.preparing[ws.session_id]
                    })
            }

            // If it's not a reconnect, then
            // it must be a spectator join
            // a session can be multiple spectators
            else {

                // Set the socket as spectator of the room
                this.spectators[ws.id] = ws;

                // Send spectator info of game
                ws.sendMessage(this.game.spectatorInfo);
            }

            // Assign rooms id with any means of joining
            ws.room_id = this.id;

            // When game is still in preparation phase
            if (this.game.preparing)
                ws.sendMessage({ type: "start_prep" });

            // Let the user know who's turn it is when game has started
            else
                ws.sendMessage(this.game.turnInfo);
        }
    }

    // When a player chooses to restart
    readyRestart(session_id) {
        if (session_id in this.player_sockets) {
            this.restart[session_id] = true;
            if (this.canRestartGame()) {
                this.startGame();
                this.restart = false;
            }
        }
    }

    // When a socket leaves the room
    // situations:
    // - player at wait screen leave by button
    // - player in a game leave by going off site
    // - spectator in a game leave by button
    leaveRoom(ws) {

        // When the game hasn't started
        if (!this.game) {

            // See if it's the only player that is
            // leaving, if so close the room
            this.closeRoom();
        }

        // When the game has started
        else {

            // Check if session is already a player
            if (ws.session_id in this.player_sockets) {
                this.player_sockets[ws.session_id] = false;

                // If someone has left already
                // there should be no players in
                // the room thus close the room

                // Or the game has finished then
                // room can finish up
                if (this.left_room_timeout || this.game.finished)
                    this.closeRoom()

                // There's still one player after
                // this player leaves, wait for
                // the player to reconnect
                else {
                    let that = this;
                    this.left_room_timeout = setTimeout(
                        () => {that.closeRoom()},
                        config.leave_room_timeout * 1000
                    )
                }
            }

            // The socket leaving is a spectator
            else {
                ws.sendMessage({
                    type: "left_room"
                });
                delete this.spectators[ws.id];
            }
            ws.room_id = false;
        }
    }

    // Tell all the users in the room, that the
    // room is closing and then delete this room
    closeRoom() {

        console.log("CLOSING ROOM")
        // Remove room from player socket and session
        // and announce the room is closing
        for (let p_sesh in this.player_sockets) {
            Session.getSession(p_sesh).delRoom(this.id);

            let socket = this.player_sockets[p_sesh];
            if (socket) {
                socket.room_id = false;
                socket.sendMessage({
                    type: "room_close"
                })
            }
        }

        // Remove the room from spectator socket then
        // announce the room is closing
        Object.values(this.spectators).map( (s) => {
            s.room_id = false;
            s.sendMessage({
                type: "room_close"
            })
        })

        // Lastly delete all reference to this room
        Room.delRoom(this.id);
    }

    static getRoom(room_id) {
        return this.ROOMS[room_id];
    }

    static delRoom(room_id) {
        delete this.ROOMS[room_id];
    }

    static VacantPublicRoom(session_id) {
        for (let room of Object.values(this.ROOMS)) {
            if (!room.private_room && !room.game && !room.isSeshIn(session_id)) {
                return room;
            }
        }
        return false;
    }
}
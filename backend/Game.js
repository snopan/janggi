import Room from "./Room.js"
import utils from "./utils.js"
import janggi from "./janggi.js";

export default class {

    constructor(room_id, player_1_session, player_2_session) {
        this.room_id = room_id;

        // There's preparation phase where players can
        // swap left or right elephant & horse
        this.preparing = {
            [player_1_session]: false,
            [player_2_session]: false
        };
        this.finished = false;
        this.turn = false;
        this.player_checked = false;
        this.checked_moves = false;

         // Pick one of the two player to be blue
        this.blue_player = utils.randomElement([player_1_session, player_2_session]);

        // Players info regarding to game
        this.players = {
            [player_1_session]: {
                scores: 0,
                color: player_1_session === this.blue_player ?
                    "blue" : "red",
                pieces: player_1_session === this.blue_player ?
                    this.blueTable : this.redTable

            },
            [player_2_session]: {
                scores: 0,
                color: player_2_session === this.blue_player ?
                    "blue" : "red",
                pieces: player_2_session === this.blue_player ?
                    this.blueTable : this.redTable
            }
        }
    }

    // Check if all players are ready with their preparations
    get finishedPreparing() {
        if (this.preparing) {
            return Object.values(this.preparing).every((elem) => {return elem});
        }
        else return false;
    }

    endPreparation() {
        this.preparing = false;

        // Announce the end of preparation
        let room = Room.getRoom(this.room_id);
        room.broadcastMessage({type: "end_prepare"});

        // Start the first turn
        this.nextTurn();
    }

    setReadyPrep(player_sesh) {
        this.preparing[player_sesh] = true;
        if (this.finishedPreparing)
            this.endPreparation();
    }

    swapPiece(player_sesh, side) {

        // NEED TO IMPLEMENT SWAPPING BEHAVIOUR
        let color = this.players[player_sesh].color

        // Swap the pieces on the server side boards
        for (let p_sesh in this.players)
            janggi.swapPiece(
                this.players[p_sesh].pieces,
                this.players[p_sesh].color,
                side,
                this.players[player_sesh].color
            )

        // Announce the swap to everyone
        let room = Room.getRoom(this.room_id);
        room.broadcastMessage({
            type: "swap_piece",
            side: side,
            color: color
        })
    }

    // Check if the player with the given session
    // id has killed the other player's king
    killedKing(session_id) {
        let p = this.players[session_id];
        for (let piece of Object.values(p.pieces)) {
            if (piece.color !== p.color && piece.piece === "king")
                return false;
        }
        return true;
    }

    // Set the game to a standby waiting for restart
    // and that announce the winner of this game
    announceFinish(winner_session) {
        this.finished = true;
        let room = Room.getRoom(this.room_id);
        room.broadcastMessage({
            type: "game_finish",
            winner: this.players[winner_session].color
        })
    }

    getOtherPlayerSesh(session_id) {
        for (let p_sesh in this.players) {
            if (p_sesh !== session_id) return p_sesh;
        }
    }

    // Check whether this user can move piece
    // at "from" position to the "to" position
    canMove(session_id, from, to) {

        // See if it is this user's turn
        if (this.turn === session_id) {
            let player = this.players[session_id],
                from_piece = player.pieces[from];

            // Check if this piece exist or
            // even on their team
            if (from_piece && from_piece.color === player.color) {

                // Check where this from piece can go
                let moves = janggi.getMoves(
                    from_piece.piece,
                    from,
                    player.pieces,
                    player.color
                )

                // When the given move is valid
                return (to in moves);
            }
            else return false;
        }
        else return false;
    }

    movePiece(from, to) {

        // Since a move has been made, if the player
        // has been checked then it is no longer
        this.player_checked = false;
        this.checked_moves = false;

        // Move the piece in the both player's board
        for (let p_sesh in this.players)
            janggi.movePiece(
                p_sesh,
                this.turn,
                this.players[p_sesh].pieces,
                from,
                to
            )

        // Tell all users about the move and who's move
        let room = Room.getRoom(this.room_id);
        room.broadcastMessage({
            type: "execute_move",
            color: this.players[this.turn].color,
            from: from,
            to: to
        })
    }

    // Checks if the piece in the given pos
    // can check the other side's king
    inCheck(session_id) {
        let player = this.players[session_id];

        if (janggi.inCheck(player.color, player.pieces)) {
            this.player_checked = this.getOtherPlayerSesh(session_id);
            this.checked_moves = janggi.findCheckMoves(
                player.color,
                this.players[this.player_checked].color,
                player.pieces,
                this.players[this.player_checked].pieces
            );
            return true;
        }
        else return false;
    }

    // This is called when a move is found to
    // put the other player in check, where
    // this will then tell the user about the check
    announceCheck() {
        let room = Room.getRoom(this.room_id);

        // Let all user know the other player
        // is currently getting checked
        room.broadcastMessage({
            type: "in_check",
            checked_color: this.players[this.player_checked].color,
            checked_moves: this.checked_moves
        })
    }

    // Moves the game to the next turn
    // letting all user in the room know
    nextTurn() {

        // When it's no ones turn, blue
        // player should start off
        if (!this.turn)
            this.turn = this.blue_player;

        // Get the next player, and let
        // everyone know who's turn it is
        else
            this.turn = this.getOtherPlayerSesh(this.turn);

        // Let the whole room know the next turn
        let room = Room.getRoom(this.room_id);

        room.broadcastMessage(this.turnInfo)
    }

    playerInfo(session_id) {
        return {
            type: "setup_game",
            color: this.players[session_id].color,
            pieces: this.players[session_id].pieces,
            checked_color: this.player_checked ?
                this.players[this.player_checked].color : false,
            checked_moves: this.player_checked ?
                this.checked_moves : false
        }
    }

    get spectatorInfo() {
        return {
            type: "setup_game",
            spectator_color: "blue",
            pieces: this.players[this.blue_player].pieces,
            checked_color: this.player_checked ?
                this.players[this.player_checked].color : false
        }
    }

    // Checks whether the check was a checkmate
    get inCheckmate() {
        return Object.keys(this.checked_moves).length == 0;
    }

    get turnInfo() {
        return {
            type: "next_turn",
            turn: this.players[this.turn].color
        }
    }

    // Returns a board that is setup with
    // red on top and blue on bottom
    get blueTable() {
        return {
            "00": {piece: "rook", color: "red"},
            "01": {piece: "horse", color: "red"},
            "02": {piece: "elephant", color: "red"},
            "03": {piece: "guard", color: "red"},
            "05": {piece: "guard", color: "red"},
            "06": {piece: "elephant", color: "red"},
            "07": {piece: "horse", color: "red"},
            "08": {piece: "rook", color: "red"},
            "14": {piece: "king", color: "red"},
            "21": {piece: "cannon", color: "red"},
            "27": {piece: "cannon", color: "red"},
            "30": {piece: "pawn", color: "red"},
            "32": {piece: "pawn", color: "red"},
            "34": {piece: "pawn", color: "red"},
            "36": {piece: "pawn", color: "red"},
            "38": {piece: "pawn", color: "red"},
            "60": {piece: "pawn", color: "blue"},
            "62": {piece: "pawn", color: "blue"},
            "64": {piece: "pawn", color: "blue"},
            "66": {piece: "pawn", color: "blue"},
            "68": {piece: "pawn", color: "blue"},
            "71": {piece: "cannon", color: "blue"},
            "77": {piece: "cannon", color: "blue"},
            "84": {piece: "king", color: "blue"},
            "90": {piece: "rook", color: "blue"},
            "91": {piece: "horse", color: "blue"},
            "92": {piece: "elephant", color: "blue"},
            "93": {piece: "guard", color: "blue"},
            "95": {piece: "guard", color: "blue"},
            "96": {piece: "elephant", color: "blue"},
            "97": {piece: "horse", color: "blue"},
            "98": {piece: "rook", color: "blue"}
        }
    }

    // Returns a board that is setup with
    // blue on top and red on bottom
    get redTable() {
        return {
            "00": {piece: "rook", color: "blue"},
            "01": {piece: "horse", color: "blue"},
            "02": {piece: "elephant", color: "blue"},
            "03": {piece: "guard", color: "blue"},
            "05": {piece: "guard", color: "blue"},
            "06": {piece: "elephant", color: "blue"},
            "07": {piece: "horse", color: "blue"},
            "08": {piece: "rook", color: "blue"},
            "14": {piece: "king", color: "blue"},
            "21": {piece: "cannon", color: "blue"},
            "27": {piece: "cannon", color: "blue"},
            "30": {piece: "pawn", color: "blue"},
            "32": {piece: "pawn", color: "blue"},
            "34": {piece: "pawn", color: "blue"},
            "36": {piece: "pawn", color: "blue"},
            "38": {piece: "pawn", color: "blue"},
            "60": {piece: "pawn", color: "red"},
            "62": {piece: "pawn", color: "red"},
            "64": {piece: "pawn", color: "red"},
            "66": {piece: "pawn", color: "red"},
            "68": {piece: "pawn", color: "red"},
            "71": {piece: "cannon", color: "red"},
            "77": {piece: "cannon", color: "red"},
            "84": {piece: "king", color: "red"},
            "90": {piece: "rook", color: "red"},
            "91": {piece: "horse", color: "red"},
            "92": {piece: "elephant", color: "red"},
            "93": {piece: "guard", color: "red"},
            "95": {piece: "guard", color: "red"},
            "96": {piece: "elephant", color: "red"},
            "97": {piece: "horse", color: "red"},
            "98": {piece: "rook", color: "red"}
        }
    }
}
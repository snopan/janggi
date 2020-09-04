import janggi from "../../../../janggi";
import utils from "../../../../utils.js";

const updateGameResize = (state) => {
    let left_right_margin = 50,
        top_bot_margin = 100;

    // Check if the window width with a 200px div accounted for
    // can fit the chess board at window height - 50px, by comparing
    // the window width - 200px to the width of board at full
    // height - 50px, we can find the latter through ratios of the board
    if (window.innerWidth - left_right_margin > (window.innerHeight - top_bot_margin) * 693/773) {

        // When there's more space in width, take up all
        // the space in height
        state.board.board_height = window.innerHeight - top_bot_margin;
        state.board.board_width = state.board.board_height * 693/773;
    }
    else {

        // When there's more space in height, take up all
        // the space in width
        state.board.board_width = window.innerWidth - left_right_margin;
        state.board.board_height = state.board.board_width * 773/693;
    }

    state.board.square_thickness = 70/773* state.board.board_height;
    state.board.left_boarder_thickness = 88/693 * state.board.board_width;
    state.board.top_boarder_thickness = 47/773 * state.board.board_height;
}

const setGameScreen = (state, { pieces, color, spectator_color }) => {

    // Server side's structure for pieces is
    // { position: { piece, color }, ... }, but
    // it needs to be converted to
    // [{ position, piece, color }, ...]
    // this prevents replacement of object in
    // the future so any change in position will
    // be able to be animated

    utils.objArrAssignID(Object.values(pieces))
    state.pieces = pieces;
    state.player_color = color !== undefined ? color : false;
    state.spectator_color = spectator_color !== undefined ? spectator_color : false;
}

const resetGameScreen = (state) => {
    state.player_color = false;
    state.spectator_color = false;
    state.checked_color = false,
    state.checked_moves = false,
    state.winner = false;
    state.pieces = {};
    state.selecting_piece = false;
    state.selecting_position = false;
    state.possible_cells = {};
    state.our_turn = false;
    state.preparation = false;
    state.clicked_ready = false;
    state.wait_left_swap = false;
    state.wait_right_swap = false;
}

const setSwap = (state , { side, wait }) => {
    if (side === "L")
        state.wait_left_swap = wait;
    if (side === "R")
        state.wait_right_swap = wait;
}

const swapPiece = (state, { side, side_color }) => {
    janggi.swapPiece(
        state.pieces,
        state.player_color,
        side,
        side_color
    )
}

const setReady = (state, ready) => {
    state.clicked_ready = ready;
}

const setPreparation = (state, prep_state) => {
    state.preparation = prep_state;
}

const setWinner = (state, winner_color) => {
    state.clicked_restart = false;
    state.winner = winner_color;
}

const clickRestart = (state) => {
    state.clicked_restart = true;
}

const nextTurn = (state, turn) => {
    state.turn = turn;
}

const selectPiece = (state, { piece, position }) => {
    state.selecting_piece = piece;
    state.selecting_position = position;

    if (state.checked_moves) {

        state.possible_cells = {};

        // When this selected piece can move
        // given the checked situation
        if (position in state.checked_moves)
            for (let to_pos in state.checked_moves[position])
                state.possible_cells[to_pos] = state.checked_moves[position][to_pos];
    }
    else {

        // let moves = state.janggi.getMoves(piece, row, col, state.pieces);
        // Loop through moves and separate
        // possible moves from possible takedown
        state.possible_cells = janggi.getMoves(
            piece,
            position,
            state.pieces,
            state.player_color
        )
    }
}

const unselectPiece = (state) => {
    // Unselect the current piece and
    // empty the possible cells array

    state.selecting_piece = false;
    state.selecting_position = false;
    state.possible_cells = {};
}

const executeMove = (state, { color, from, to }) => {

    // Move the given piece on the board
    janggi.movePiece(
        state.player_color ? state.player_color : state.spectator_color,
        color,
        state.pieces,
        from,
        to
    )

    // When a piece is moved, then it should be off check
    state.checked_color = false;
    state.checked_moves = false;
}

const setCheck = (state, { checked_color, checked_moves }) => {
    state.checked_color = checked_color;

    // Use the checked moves if current
    // player is the one being checked
    if (state.checked_color === state.player_color) {
        state.checked_moves = checked_moves;
    }
}


export default {
    updateGameResize,
    setGameScreen,
    setSwap,
    setReady,
    setPreparation,
    swapPiece,
    resetGameScreen,
    setWinner,
    clickRestart,
    nextTurn,
    selectPiece,
    unselectPiece,
    executeMove,
    setCheck
}
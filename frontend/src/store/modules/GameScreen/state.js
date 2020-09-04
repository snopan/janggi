export default {
    player_color: false,
    spectator_color: false,
    preparation: true,
    checked_color: false,
    checked_moves: false,
    winner: false,
    board: {
        board_width: 0,
        board_height: 0,
        square_thickness: 0,
        left_boarder_thickness: 0,
        top_boarder_thickness: 0
    },
    pieces: [],
    selecting_piece: false,
    selecting_position: false,

    // Hold cells of format
    // { piece, on_enemy }
    possible_cells: {},
    turn: false,

    clicked_restart: false,
    clicked_ready: false,
    wait_left_swap: false,
    wait_right_swap: false
}
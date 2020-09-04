
// Gets possible moves for a piece where we only
// consider our friendly pieces being on the bottom
// and enemy pieces on top
const getMoves = (piece, pos, board_pieces, friendly_color) => {
    let possible_moves = [],
        row = pos[0],
        col = pos[1];

    // Get all the moves a certain piece can move to
    switch (piece) {
        case "king":
        case "guard":
            possible_moves = fortressMoves(row, col);
            break;
        case "horse":

            // Return value from horseMoves is an object because
            // elephantMoves needs it, just take the values
            possible_moves = horseMoves(row, col, board_pieces);
            possible_moves = Object.values(possible_moves);
            break;
        case "elephant":
            possible_moves = elephantMoves(row, col, board_pieces);
            break;
        case "rook":
            possible_moves = rookMoves(row, col, board_pieces);
            break;
        case "cannon":
            possible_moves = cannonMoves(row, col, board_pieces);
            break;
        case "pawn":
            possible_moves = pawnMoves(row, col);
            break;
    }

    // Keep only the valid positions
    possible_moves = possible_moves.filter( (pm) => {

        // Has to be a valid coordinate
        // that is within the board
        return pm.length == 2 &&
            0 <= parseInt(pm[0]) && parseInt(pm[0]) <= 9 &&
            0 <= parseInt(pm[1]) && parseInt(pm[1]) <= 8;
    })

    let output = {};
    possible_moves.map( (pm) => {

        // See if the position is on
        // an enemy, if so then keep
        // info on the enemy piece
        // if the position is on
        // friendly piece, don't
        // keep this position
        let on_piece = pm in board_pieces,
            on_enemy = on_piece ?
                board_pieces[pm].color != friendly_color : false,
            enemy_piece = on_enemy ?
                board_pieces[pm].piece : "";

        // When it's a move or takedown
        if (!on_piece || on_enemy) {
            output[pm] = {
                piece: enemy_piece,
                on_enemy: on_enemy
            }
        }
    })

    // An object of pieces object {"12": {piece, on_enemy}, ...}
    return output;
}

const fortressMoves = (row, col) => {
    // Kings and Guards move the same

    // Generate front, back, left, right first
    let possible_moves = [
        addToStrInt(row, -1) + col,
        addToStrInt(row, 1) + col,
        row + addToStrInt(col, -1),
        row + addToStrInt(col, 1)
    ];

    // Can only move diagonal on the coordinates
    // "73", "75", "84", "93" and "95"
    if (["73", "75", "84", "93", "95"].includes(row+col)) {

        // Add all the directional moves
        possible_moves.push(addToStrInt(row, -1)+addToStrInt(col, -1))
        possible_moves.push(addToStrInt(row, -1)+addToStrInt(col, 1))
        possible_moves.push(addToStrInt(row, 1)+addToStrInt(col, -1))
        possible_moves.push(addToStrInt(row, 1)+addToStrInt(col, 1))
    }

    // Save only the ones that are within
    // the nine point fortress which is
    // row 7-9 col 2-4 assuming the
    // fortress here is on the bottom
    possible_moves = possible_moves.filter( (p) => {
        let row = parseInt(p[0]),
            col = parseInt(p[1]);
        return (
            7 <= row && row <= 9 &&
            3 <= col && col <= 5
        ) && p.length === 2;
    })

    return possible_moves;
}

const horseMoves = (row, col, board_pieces) => {

    // First the horse moves front, back, left, right
    let first_step = {
        front: addToStrInt(row, -1) + col,
        back: addToStrInt(row, 1) + col,
        left: row + addToStrInt(col, -1),
        right: row + addToStrInt(col, 1)
    }

    // Stores the diagonal direction as key and
    // position as value, reason is elephant moves
    // makes use of this as first part, if purely
    // used for horse moves then just take the value
    // array out later
    let diagonal_step = {};

    // Check for whether each direction is
    // clear for movement the move diagonally
    for (let dir of Object.keys(first_step)) {

        let position = first_step[dir],

            // When there's a piece blocking
            // the horse can not move there
            blocked = board_pieces[position] != undefined;

        // Where there's no blocking, the horse
        // can move to the two diagonal end
        if (!blocked && position.length == 2) {
            let [step_row, step_col] = position,
                move_row, move_col;
            switch (dir) {
                case "front":
                case "back":

                    // Move one more in the same direction
                    // then left and right to be diagonal
                    move_row = addToStrInt(step_row, (dir == "front" ? -1 : 1))

                    // Left
                    diagonal_step[dir+"_left"] =
                        move_row + addToStrInt(step_col, -1);

                    // Right
                    diagonal_step[dir+"_right"] =
                        move_row + addToStrInt(step_col, 1);
                    break;
                case "left":
                case "right":

                    // Move one more in the same direction
                    // then front and back to be diagonal
                    move_col = addToStrInt(step_col, (dir == "left" ? -1 : 1))

                    // Front
                    diagonal_step[dir+"_front"] =
                        addToStrInt(step_row, -1) + move_col;

                    // Back
                    diagonal_step[dir+"_back"] =
                        addToStrInt(step_row, 1) + move_col;
                    break;
            }
        }
    }

    return diagonal_step;
}

const elephantMoves = (row, col, board_pieces) => {

    // The elephant moves similar to the horse, but the
    // difference is that the elephant moves one more in the
    // diagonal direction and can be blocked during the
    // first and second step
    let second_steps = horseMoves(row, col, board_pieces)

    // One more diagonal step in each direction in
    // second_steps given that it wasn't blocked
    let diagonal_step = [];

    // Check if the second step is blocked by any pieces
    for (let dir of Object.keys(second_steps)) {

        let position = second_steps[dir],

            // When there's a piece blocking
            // the horse can not move there
            blocked = board_pieces[position] != undefined;

        if (!blocked && position.length == 2) {
            let split_dir = dir.split("_"),
                step_row = parseInt(position[0]),
                step_col = parseInt(position[1]);

            split_dir.map( (d) => {
                switch (d) {
                    case "front":
                        step_row --;
                        break;
                    case "back":
                        step_row ++;
                        break;
                    case "left":
                        step_col --;
                        break;
                    case "right":
                        step_col ++;
                        break;
                }
            })

            diagonal_step.push(step_row.toString() + step_col.toString());
        }
    }

    return diagonal_step;
}

const rookMoves = (row, col, board_pieces) => {
    let row_top = 0,
        row_bottom = 9,
        col_left = 0,
        col_right = 8;

    // When a piece blocks the rook, the
    // positions after the piece will not
    // be available, thus this finds the
    // range of available move positions
    Object.keys(board_pieces).map( (bp) => {

        // Cant consider the piece itself
        if (bp != row+col) {
            let piece_row = parseInt(bp[0]),
                piece_col = parseInt(bp[1]);

            // When the piece is on the same row as rook
            if (piece_row == parseInt(row)) {

                // The piece is left of the rook
                if (piece_col < col) col_left = Math.max(col_left, piece_col);

                // The piece is right of the rook
                else col_right = Math.min(col_right, piece_col);
            }

            // When the piece is on the same col as rook
            else if (piece_col == parseInt(col)) {

                // The piece is above the rook
                if (piece_row < row) row_top = Math.max(row_top, piece_row);

                // The piece is below the rook
                else row_bottom = Math.min(row_bottom, piece_row);
            }
        }
    })

    let possible_moves = [];

    // With the given range, generate all the moves
    for (let r=row_top; r<=row_bottom; r++) {
        if (r != parseInt(row)) possible_moves.push(r.toString()+col);
    }
    for (let c=col_left; c<=col_right; c++) {
        if (c != parseInt(col)) possible_moves.push(row+c.toString());
    }

    // Consider if the rook is in the nine
    // point fortress then it can move diagonally
    // only 5 points within the fortress allows
    // diagonal movement
    let first_diagonal = {},
        addDiagonal = (dir) => {
            switch (dir) {
                case "front_left":
                    first_diagonal[dir] = addToStrInt(row, -1)+addToStrInt(col, -1);
                    break;
                case "front_right":
                    first_diagonal[dir] = addToStrInt(row, -1)+addToStrInt(col, 1);
                    break;
                case "back_left":
                    first_diagonal[dir] = addToStrInt(row, 1)+addToStrInt(col, -1);
                    break;
                case "back_right":
                    first_diagonal[dir] = addToStrInt(row, 1)+addToStrInt(col, 1);
                    break;
            }
        }

    // The rook can only move 2 blocks
    // diagonally in the fortress, this
    // is the first diagonal steps
    switch (row+col) {
        case "03":
            addDiagonal("back_right");
            break;
        case "14":
            addDiagonal("front_left");
            addDiagonal("front_right");
            addDiagonal("back_left");
            addDiagonal("back_right");
            break;
        case "05":
            addDiagonal("back_left");
            break;
        case "23":
            addDiagonal("front_right");
            break;
        case "25":
            addDiagonal("front_left");
            break;
        case "73":
            addDiagonal("back_right");
            break;
        case "84":
            addDiagonal("front_left");
            addDiagonal("front_right");
            addDiagonal("back_left");
            addDiagonal("back_right");
            break;
        case "75":
            addDiagonal("back_left");
            break;
        case "93":
            addDiagonal("front_right");
            break;
        case "95":
            addDiagonal("front_left");
            break;
    }

    // Generate all diagonal moves,
    // add the diagonal positions as long as
    // they aren't outside the fortress,
    // but for another diagonal step, the
    // rook must've reached the centre of the
    // fortress and did not get blocked
    for (let dir of Object.keys(first_diagonal)) {
        let p = first_diagonal[dir],
            p_row = parseInt(p[0]),
            p_col = parseInt(p[1]),
            blocked = board_pieces[p] != undefined,
            in_fortress_centre =
                p_row == 1 && p_col == 4 ||
                p_row == 8 && p_col == 4;

        // First diagonal move should keep
        // the rook inside the fortress
        possible_moves.push(p);

        // The only way the rook can move again
        // is if the diagonal move led it to the
        // centre of the fortress, the middle
        // also should not be blocked
        if (!blocked && in_fortress_centre) {

            // Go 1 further step in the
            // given diagonal direction
            let split_dir = dir.split("_");
            split_dir.map( (d) => {
                switch (d) {
                    case "front":
                        p_row --;
                        break;
                    case "back":
                        p_row ++;
                        break;
                    case "left":
                        p_col --;
                        break;
                    case "right":
                        p_col ++;
                        break;
                }
            })
            possible_moves.push(p_row.toString() + p_col.toString());
        }

    }

    return possible_moves;
}

const cannonMoves = (row, col, board_pieces) => {

    // The range where cannon can move
    // it is determined by the first
    // and second piece that is inline
    // with the cannon's row or col
    // it is in the form [min, max]
    let row_top = [0, 0],
        row_bottom = [9, 9],
        col_left = [0, 0],
        col_right = [8, 8];

    Object.keys(board_pieces).map( (bp) => {

        // Cant consider the piece itself
        if (bp != row+col) {
            let piece_row = parseInt(bp[0]),
                piece_col = parseInt(bp[1]);

            // When the piece is on the same row as cannon
            if (piece_row == parseInt(row)) {

                // The piece is left of the cannon
                if (piece_col < col) {

                    // When the col is larger than the max
                    // so a new range will be from [max, piece_col]
                    if (piece_col > col_left[1]) {
                        col_left[0] = col_left[1];
                        col_left[1] = piece_col;
                    }

                    // When the col is larger than the min but not max
                    // so a new range will be from [piece_col, max]
                    else if (piece_col > col_left[0]) {
                        col_left[0] = piece_col;
                    }
                }

                // The piece is right of the cannon
                else {

                    // When the col is smaller than the min
                    // so the new range will be from [piece_col, min]
                    if (piece_col < col_right[0]) {
                        col_right[1] = col_right[0];
                        col_right[0] = piece_col;
                    }

                    // When the col is smaller than the max but not min
                    // so the new range will be from [min, piece_col]
                    else if (piece_col < col_right[1]) {
                        col_right[1] = piece_col;
                    }
                }
            }

            // When the piece is on the same col as cannon
            else if (piece_col == parseInt(col)) {

                // The piece is above of the cannon
                if (piece_row < row) {

                    // When the row is larger than the max
                    // so a new range will be from [max, piece_row]
                    if (piece_row > row_top[1]) {
                        row_top[0] = row_top[1];
                        row_top[1] = piece_row;
                    }

                    // When the row is larger than the min but not max
                    // so a new range will be from [piece_row, max]
                    else if (piece_row > row_top[0]) {
                        row_top[0] = piece_row;
                    }
                }

                // The piece is below of the cannon
                else {

                    // When the row is smaller than the min
                    // so the new range will be from [piece_row, min]
                    if (piece_row < row_bottom[0]) {
                        row_bottom[1] = row_bottom[0];
                        row_bottom[0] = piece_row;
                    }

                    // When the row is smaller than the max but not min
                    // so the new range will be from [min, piece_row]
                    else if (piece_row < row_bottom[1]) {
                        row_bottom[1] = piece_row;
                    }
                }
            }
        }
    })

    let possible_moves = [],

        // Test if these limits are another cannon piece
        // if so then the cannon can not move in this dir
        top_limit = row_top[1].toString()+col,
        bot_limit = row_bottom[0].toString()+col,
        left_limit = row+col_left[1].toString(),
        right_limit = row+col_right[0].toString(),
        top_blocked = top_limit in board_pieces ?
            board_pieces[top_limit].piece === "cannon" : false,
        bot_blocked = bot_limit in board_pieces ?
            board_pieces[bot_limit].piece === "cannon" : false,
        left_blocked = left_limit in board_pieces ?
            board_pieces[left_limit].piece === "cannon" : false,
        right_blocked = right_limit in board_pieces ?
            board_pieces[right_limit].piece === "cannon" : false;

    // With the given range, generate all the moves
    if (!top_blocked)

    // "<" and not "<=" so to not include the end
    for (let r=row_top[0]; r<row_top[1]; r++) {
        possible_moves.push(r.toString()+col);
    }

    if (!bot_blocked)

    // the +1 so to not include the start but
    // include the end with "<="
    for (let r=row_bottom[0]+1; r<=row_bottom[1]; r++) {
        possible_moves.push(r.toString()+col);
    }

    if (!left_blocked)
    for (let c=col_left[0]; c<col_left[1]; c++) {
        possible_moves.push(row+c.toString());
    }

    if (!right_blocked)
    for (let c=col_right[0]+1; c<=col_right[1]; c++) {
        possible_moves.push(row+c.toString());
    }

    // Consider if the cannon is in the nine
    // point fortress then it can move diagonally
    // the only situation where cannon can jump
    // is if it's in the corner and a non cannon
    // piece is in the centre

    // Checking if a piece is in the centre then
    // also check if that piece is another cannon
    let top_fortress_centre = board_pieces["14"] != undefined,
        top_centre_cannon = top_fortress_centre ?
            board_pieces["14"].piece == "cannon" : false,
        bot_fortress_centre = board_pieces["84"] != undefined,
        bot_centre_cannon = bot_fortress_centre ?
            board_pieces["84"].piece == "cannon" : false;

    if (top_fortress_centre && !top_centre_cannon) {
        switch (row + col) {
            case "03":
                possible_moves.push("25");
                break;
            case "05":
                possible_moves.push("23");
                break;
            case "23":
                possible_moves.push("05");
                break;
            case "25":
                possible_moves.push("03");
                break;
        }
    }
    if (bot_fortress_centre && !bot_centre_cannon) {
        switch (row + col) {
            case "73":
                possible_moves.push("95");
                break;
            case "75":
                possible_moves.push("93");
                break;
            case "93":
                possible_moves.push("75");
                break;
            case "95":
                possible_moves.push("73");
                break;
        }
    }

    return possible_moves;
}

const pawnMoves = (row, col) => {

    // Can only move 1 block front,
    // left and right
    let possible_moves = [
        addToStrInt(row, -1)+col,
        row+addToStrInt(col, -1),
        row+addToStrInt(col, 1)
    ];

    // Check if the moves go out of border
    possible_moves.filter( (p) => {
        let row = parseInt(p[0]),
            col = parseInt(p[1]);
        return !(
            0 <= row && row <= 9 &&
            0 <= col && col <= 8
        )
    })

    // Check first if pawn is in the top fortress
    if (0 <= parseInt(row) && parseInt(row) <= 2 &&
        3 <= parseInt(col) && parseInt(col) <= 5) {

        // Diagonal moves that can happen
        // within the nine point fortress
        let fortress_moves = [
            addToStrInt(row, -1) + addToStrInt(col, -1),
            addToStrInt(row, -1) + addToStrInt(col, 1)
        ]

        // When a pawn enters the fortress
        // the only possible position it can
        // go through diagonal travel is
        // "03", "12" and "05"
        fortress_moves = fortress_moves.filter( (p) => {
            return (["03", "14", "05"].includes(p));
        })

        possible_moves = possible_moves.concat(fortress_moves)
    }

    return possible_moves;
}

// Finds the moves for checked player (in respect to his board)
// that they can do when currently in check
const findCheckMoves = (checking_color, checked_color, checking_player_board, checked_player_board) => {
    let possible_moves = {};

    for (let piece_pos in checked_player_board) {

        // Only move pieces from the checked player
        if (checked_player_board[piece_pos].color === checked_color) {

            // Find what moves the checked player can
            // do with this one piece
            let piece_moves = getMoves(
                checked_player_board[piece_pos].piece,
                piece_pos,
                checked_player_board,
                checked_color
            )

            // Simulated the all moves for this piece
            // and for each move check if the player
            // is still being checked
            for (let to_pos in piece_moves) {

                // Every simulation, make a copy of
                // of the checking_players board,
                // because we need to looking in
                // checking player's perspective if
                // they're still checking the player

                // Only shallow copy is needed
                let checking_p_b_copy = Object.assign(
                    {},
                    checking_player_board
                );

                // Making a move for checked player
                // on checking player's board
                movePiece(
                    checking_color,
                    checked_color,
                    checking_p_b_copy,
                    piece_pos,
                    to_pos
                )

                // Now find if the checking player cannot check
                // again after that move then add this move to the
                // list of what the checked player can do
                if (!inCheck(checking_color, checking_p_b_copy)) {
                    if (!(piece_pos in possible_moves))
                        possible_moves[piece_pos] = {}

                    possible_moves[piece_pos][to_pos] = piece_moves[to_pos];
                }
            }
        }
    }

    return possible_moves;
}

// Checks if player moving is in it's current state
// is able to check the other player
const inCheck = (moving_color, moving_board) => {
    for (let moving_piece_pos in moving_board) {
        let moving_piece = moving_board[moving_piece_pos];

        // Only check this piece if it belongs to moving player
        if (moving_piece.color === moving_color) {

            // Check where this from piece can go in the next move
            let moves = getMoves(
                moving_piece.piece,
                moving_piece_pos,
                moving_board,
                moving_color
            )

            // See if the other player's king is in the next moves
            for (let next_piece of Object.values(moves)) {

                // When the next possible move contains a king
                // that is the opposite color then is in check
                if (next_piece.piece === "king" &&
                    next_piece.color !== moving_color) {
                    return true;
                }
            }
        }
    }
    return false;
}

const movePiece = (color, moving_color, player_board, from, to) => {
    let from_pos = from,
        to_pos = to;

    // When the moving player is not us, we
    // need to take their move instruction and
    // translate it to move pieces for our board
    if (color !== moving_color) {
        from_pos = flipCoordinate(from_pos);
        to_pos = flipCoordinate(to_pos);
    }

    // Remove the piece at "to" position if any
    delete player_board[to_pos];

    // Move the piece at "from" to "to"
    player_board[to_pos] = player_board[from_pos];

    // Then lastly remove the reference at "from"
    delete player_board[from_pos];

    return player_board;
}

const swapPiece = (board_pieces, board_color, side, side_color) => {
    let horse_pos, elephant_pos;

    // These position are assumption that
    // board_color is same as side_color
    if (side === "R") {
        horse_pos = "97";
        elephant_pos = "96";
    }
    else if (side === "L") {
        horse_pos = "91";
        elephant_pos = "92";
    }

    // Not a valid side
    else return false;

    // When board_color isn't the same as side_color
    if (board_color !== side_color) {
        horse_pos = flipCoordinate(horse_pos);
        elephant_pos = flipCoordinate(elephant_pos);
    }

    let horse_piece = board_pieces[horse_pos],
        elephant_piece = board_pieces[elephant_pos];

    if (

        // Make sure both pieces belong to player
        (horse_piece.color === side_color &&
        elephant_piece.color === side_color) &&

        // Make sure both pieces include horse
        // and elephant and order doesnt matter
        ((elephant_piece.piece === "elephant" &&
        horse_piece.piece === "horse" ) ||
        (elephant_piece.piece === "horse" &&
        horse_piece.piece === "elephant"))
    ) {
        board_pieces[horse_pos] = elephant_piece;
        board_pieces[elephant_pos] = horse_piece;

        // Successfully
        return true;
    }

    // Horse or Elephant or both aren't there
    else return false;
}

// Coordinates are given in string like "03"
// where they will be flip against the two
// middle axis of the board
const flipCoordinate = (coordinate) => {

    let row = parseInt(coordinate[0]),
        col = parseInt(coordinate[1]);

    const row_axis = 4.5;
    const col_axis = 4

    let row_distance = row - row_axis,
        new_row = row_axis - row_distance,
        col_distance = col - col_axis,
        new_col = col_axis - col_distance;

    return new_row.toString() +
            new_col.toString();
}

// Converts the str to int, then adds the
// number and converts it back to str
const addToStrInt = (str_int, number) => {
    return (parseInt(str_int)+number).toString();
}

export default {
    getMoves,
    findCheckMoves,
    inCheck,
    movePiece,
    swapPiece,
    flipCoordinate
}
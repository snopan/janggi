<template>
    <div
        id="board"
        :style="{
            width: board_width+'px',
            height: board_height+'px',
            'background-image': `url('${image}')`
        }"
    >
        <piece-cell
            v-for="(piece, pos) in pieces"
            :key="'p'+piece.id"
            :position="pos"
            :piece="piece.piece"
            :color="piece.color"
        />
        <transition-group
            name="custom-classes-transition"
            :duration="{ enter: 250 }"
            enter-active-class="animated fadeIn"
        >
            <possible-cell
                v-for="(cell, pos) in possible_cells"
                :key="'c'+pos"
                :position="pos"
                :enemy_piece="cell.piece"
                :on_enemy="cell.on_enemy"
            />
        </transition-group>
    </div>
</template>

<script>
    import PossibleCell from "./Cell/PossibleCell";
    import PieceCell from "./Cell/PieceCell";
    import ChessBoard from "../assets/korean_chess.png"
    export default {
        name: "board",
        components: {
            PossibleCell,
            PieceCell
        },
        computed: {
            image() {
                return ChessBoard;
            },
            board_width() {
                return this.$store.state.GameScreen.board.board_width;
            },
            board_height() {
                return this.$store.state.GameScreen.board.board_height;
            },
            pieces() {
                return this.$store.state.GameScreen.pieces;
            },
            possible_cells() {
                return this.$store.state.GameScreen.possible_cells;
            }
        }
    }
</script>

<style scoped>
    #board {
        background-size: cover;
        position: relative;
    }
</style>
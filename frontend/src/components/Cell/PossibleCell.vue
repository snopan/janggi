<template>
    <div
        id="cell"
        @click="movePiece"
        @mouseover="hovering = true"
        @mouseleave="hovering = false"
    >
        <cell
            :position="position"
            :image="img"
        />
    </div>
</template>

<script>
    import AvailablePossibleMove from "../../assets/available_possible_move.png"
    import UnavailablePossibleMove from "../../assets/unavailable_possible_move.png"
    import HoverAvailablePossibleMove from "../../assets/hover_available_possible_move.png"
    import HoverUnavailablePossibleMove from "../../assets/hover_unavailable_possible_move.png"
    import AvailablePossibleTakedownLarge from "../../assets/available_possible_takedown_large.png"
    import AvailablePossibleTakedownMed from "../../assets/available_possible_takedown_med.png"
    import AvailablePossibleTakedownSmall from "../../assets/available_possible_takedown_small.png"
    import UnavailablePossibleTakedownLarge from "../../assets/unavailable_possible_takedown_large.png"
    import UnavailablePossibleTakedownMed from "../../assets/unavailable_possible_takedown_med.png"
    import UnavailablePossibleTakedownSmall from "../../assets/unavailable_possible_takedown_small.png"
    import HoverAvailablePossibleTakedownLarge from "../../assets/hover_available_possible_takedown_large.png"
    import HoverAvailablePossibleTakedownMed from "../../assets/hover_available_possible_takedown_med.png"
    import HoverAvailablePossibleTakedownSmall from "../../assets/hover_available_possible_takedown_small.png"
    import HoverUnavailablePossibleTakedownLarge from "../../assets/hover_unavailable_possible_takedown_large.png"
    import HoverUnavailablePossibleTakedownMed from "../../assets/hover_unavailable_possible_takedown_med.png"
    import HoverUnavailablePossibleTakedownSmall from "../../assets/hover_unavailable_possible_takedown_small.png"
    import Cell from "../Cell";
    export default {
        name: "possible-cell",
        components: {Cell},
        data() {
            return {
                hovering: false
            }
        },
        props: {
            position: String,
            on_enemy: Boolean,
            enemy_piece: String
        },
        methods: {
            movePiece() {
                if (this.can_move)
                    this.$store.dispatch("movePiece", this.position);
            }
        },
        computed: {
            img() {
                return this.on_enemy ? this.takedown_highlight : this.move_highlight;
            },
            can_move() {
                return this.$store.state.GameScreen.turn === this.$store.state.GameScreen.player_color;
            },
            takedown_highlight() {
                switch (this.enemy_piece) {
                    case "king":
                        return this.can_move ?
                            this.hovering ? HoverAvailablePossibleTakedownLarge : AvailablePossibleTakedownLarge :
                            this.hovering ? HoverUnavailablePossibleTakedownLarge : UnavailablePossibleTakedownLarge;
                    case "cannon":
                    case "horse":
                    case "elephant":
                    case "rook":
                        return this.can_move ?
                            this.hovering ? HoverAvailablePossibleTakedownMed : AvailablePossibleTakedownMed :
                            this.hovering ? HoverUnavailablePossibleTakedownMed : UnavailablePossibleTakedownMed;
                    case "pawn":
                    case "guard":
                        return this.can_move ?
                            this.hovering ? HoverAvailablePossibleTakedownSmall : AvailablePossibleTakedownSmall :
                            this.hovering ? HoverUnavailablePossibleTakedownSmall : UnavailablePossibleTakedownSmall;
                    default:
                        return ""
                }
            },
            move_highlight() {
                return this.can_move ?
                    this.hovering ? HoverAvailablePossibleMove : AvailablePossibleMove :
                    this.hovering ? HoverUnavailablePossibleMove : UnavailablePossibleMove
            }
        }
    }
</script>

<style scoped>
    #cell {
        cursor: pointer;
    }
</style>
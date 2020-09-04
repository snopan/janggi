<template>
    <div
        v-click-outside="unselectPiece"
        @click="selectPiece"
        :style="'cursor:'+(friendly ? 'pointer;' : 'default;')"
    >
        <cell
            :position="position"
            :image="img_src"
            :background="highlight"
        />
    </div>
</template>

<script>
    import RedPawn from "../../assets/red_pawn.png"
    import RedGuard from "../../assets/red_guard.png"
    import RedCannon from "../../assets/red_cannon.png"
    import RedHorse from "../../assets/red_horse.png"
    import RedElephant from "../../assets/red_elephant.png"
    import RedRook from "../../assets/red_rook.png"
    import RedKing from "../../assets/red_king.png"
    import BluePawn from "../../assets/blue_pawn.png"
    import BlueGuard from "../../assets/blue_guard.png"
    import BlueCannon from "../../assets/blue_cannon.png"
    import BlueHorse from "../../assets/blue_horse.png"
    import BlueElephant from "../../assets/blue_elephant.png"
    import BlueRook from "../../assets/blue_rook.png"
    import BlueKing from "../../assets/blue_king.png"
    import HighlightLargeDark from "../../assets/highlight_large_dark.png"
    import HighlightMedDark from "../../assets/highlight_med_dark.png"
    import HighlightSmallDark from "../../assets/highlight_small_dark.png"
    import DangerHighlight from "../../assets/danger_highlight_large.png"
    import Cell from "../Cell";
    export default {
        name: "piece-cell",
        components: {
            Cell
        },
        props: {
            position: String,
            piece: String,
            color: String
        },
        methods: {
            selectPiece() {
                if (this.friendly) {
                    this.$store.dispatch("selectPiece", {
                        piece: this.piece,
                        position: this.position
                    });
                }
            },
            unselectPiece() {
                // Clicked off focus, so no piece
                // should be selected

                this.$store.dispatch("unselectPiece");
            }
        },
        computed: {
            selecting() {
                return this.$store.state.GameScreen.selecting_position === this.position
            },
            friendly() {
                return this.$store.state.GameScreen.player_color === this.color;
            },
            king_checked() {
                return this.$store.state.GameScreen.checked_color === this.color &&
                        this.piece === "king";
            },
            img_src() {
                let is_red = this.color == "red";
                switch (this.piece) {
                    case "pawn": return is_red ? RedPawn : BluePawn;
                    case "guard": return is_red ? RedGuard : BlueGuard;
                    case "cannon": return is_red ? RedCannon : BlueCannon;
                    case "horse": return is_red ? RedHorse : BlueHorse;
                    case "elephant": return is_red ? RedElephant : BlueElephant;
                    case "rook": return is_red ? RedRook : BlueRook;
                    case "king": return is_red ? RedKing : BlueKing;
                    default: return null
                }
            },
            highlight() {

                // When this piece is selected
                if (this.selecting) {
                    switch (this.piece) {
                        case "king":
                            return HighlightLargeDark;
                        case "cannon":
                        case "horse":
                        case "elephant":
                        case "rook":
                            return HighlightMedDark;
                        case "pawn":
                        case "guard":
                            return HighlightSmallDark;
                        default:
                            return ""
                    }
                }
                else if (this.king_checked) {
                    return DangerHighlight;
                }
                else return ""
            }
        }
    }
</script>

<style scoped>

</style>
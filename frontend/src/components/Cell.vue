<template>
    <img
        id="cell"
        draggable="false"
        :src="image"
        :width="piece_size"
        :height="piece_size"
        :style="{
            left: tween_x+'px',
            top: tween_y+'px',
            'background-image': `url('${background}')`
        }"
    />
</template>

<script>
    export default {
        name: "cell",
        props: {

            // '56' means row 5 col 6
            position: String,
            image: String,
            background: String
        },
        data(){
            return {
                tween_x: 0,
                tween_y: 0
            }
        },
        methods: {
            // pos[1] is col, which is horizontal so
            // therefore associated with x
            get_new_x() {
                return this.left_boarder_thickness +
                    this.position[1]*this.square_thickness -
                    this.piece_size/2
            },

            // pos[0] is row, which is horizontal so
            // therefore associated with y
            get_new_y() {
                return this.top_boarder_thickness +
                    this.position[0]*this.square_thickness -
                    this.piece_size/2
            }
        },
        computed: {
            left_boarder_thickness() {
                return this.$store.state.GameScreen.board.left_boarder_thickness
            },
            top_boarder_thickness() {
                return this.$store.state.GameScreen.board.top_boarder_thickness;
            },
            square_thickness() {
                return this.$store.state.GameScreen.board.square_thickness;
            },
            piece_size() {
                return this.square_thickness;
            }
        },
        watch: {

            // When it is an actual position change
            // where a player moves a piece
            // an animation is needed
            position() {
                window.TweenLite.to(this.$data, 0.5, { tween_x: this.get_new_x() });
                window.TweenLite.to(this.$data, 0.5, {    tween_y: this.get_new_y() });
            },

            // When it's a resize, position change
            // does not require animation
            piece_size: {
                immediate: true,
                handler() {
                    this.tween_x = this.get_new_x();
                    this.tween_y = this.get_new_y();
                }
            }
        }
    }
</script>

<style scoped>
    #cell {
        top: 0px;
        left: 0px;
        background-size: cover;
        position: absolute;
    }
</style>
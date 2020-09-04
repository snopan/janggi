<template>
    <div id="stats" :style="{ width: 275+'px', height:board_height+'px' }">
        <div id="box">
            <div
                class="score"
                :style="'background-color:' + this.colorConvert(other_color)"
            >
                {{player_1_score}}

            </div>
            <div
                class="score"
                :style="'background-color:' + this.colorConvert(our_color)"
            >
                {{player_2_score}}
            </div>
        </div>
        <div id="buttons">
            <b-button variant="warning">Surrender <b-icon icon="flag-fill"/></b-button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "stats",
        data() {
            return {
                player_1_score: 1,
                player_2_score: 0
            }
        },
        methods: {
            colorConvert(color) {
                if (color === "red") return "orangered"
                else if (color === "blue") return "dodgerblue"
                else return color
            }
        },
        computed: {
            board_height() {
                return this.$store.state.GameScreen.board.board_height;
            },
            our_color() {
                return this.$store.state.GameScreen.player_color ?
                    this.$store.state.GameScreen.player_color : "grey"
            },
            other_color() {
                if (this.our_color === "red") return "blue"
                else if (this.our_color === "blue") return "red"
                else return "grey"
            }
        }
    }
</script>

<style scoped>
    #stats {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    #box {
        width: 240px;
        margin-left: 25px;
        margin-top: -50px;
        background-color: white;
        box-shadow: 5px 10px 10px lightgray;
    }

    #buttons {
        width: 240px;
        display: flex;
        justify-content: space-around;
        margin-left: 25px;
        margin-top: 20px;
    }

    .score {
        width: 100%;
        height: 30px;
        text-align: center;
        font-size: 20px;
    }

    /* width */
    ::-webkit-scrollbar {
      width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
      background: #888;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
      background: #f1f1f1;
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
</style>
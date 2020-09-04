<template>
    <div id="game-screen">
        <b-overlay :show="realColor(winner)" id="finish-overlay">
            <board />
            <b-button
                id="spectator-leave-btn"
                v-if="!player_color"
                variant="primary"
                @click="leaveRoom"
            >
                <b-icon icon="caret-left"/> Back to Home
            </b-button>
            <div id="preparation-cover" v-if="preparation">
                <div id="preparation-background">
                    <div id="preparation-wrapper" v-if="!clicked_ready">
                        <b-button
                            variant="primary"
                            size="lg"
                            @click="swapSide('L')"
                        >
                            <span v-if="!wait_left_swap">
                                Swap Left
                            </span>
                            <span v-else>
                                <b-spinner small class="prep-wrap-spinner" type="grow"></b-spinner>
                                Loading...
                            </span>
                        </b-button>
                        <b-button
                            variant="success"
                            size="lg"
                            @click="prepareReady"
                        >
                            Ready
                        </b-button>
                        <b-button
                            variant="primary"
                            size="lg"
                            @click="swapSide('R')"
                        >
                            <span v-if="!wait_right_swap">
                                Swap Right
                            </span>
                            <span v-else>
                                <b-spinner small class="prep-wrap-spinner" type="grow"></b-spinner>
                                Loading...
                            </span>
                        </b-button>
                    </div>
                    <div id="prep-ready-text" v-else>
                        <b-spinner id="prep-ready-spinner" large type="grow"></b-spinner>
                        Waiting for other player to get ready
                    </div>
                </div>
            </div>
            <template v-slot:overlay >
                <div id="overlay-wrapper">
                    <div>
                        <span
                            class="text"
                            :style="'color:'+colorConvert(winner)"
                        >
                            {{winner.toUpperCase()}}
                        </span>
                        <span class="text"> Wins !</span>
                    </div>
                    <b-button
                        v-if="realColor(player_color) && !clicked_restart"
                        variant="outline-primary"
                        @click="confirmRestart"
                    >
                        Play Again
                    </b-button>
                    <div v-if="realColor(player_color) && clicked_restart">
                        Waiting for other player to be ready
                        <b-spinner
                            small
                            class="spinner"
                            variant="warning"
                            type="grow"
                            label="Spinning"
                        />
                    </div>

                    <div v-if="!realColor(player_color)">
                        Waiting for players to restart
                        <b-spinner
                            small
                            class="spinner"
                            variant="warning"
                            type="grow"
                            label="Spinning"
                        />
                    </div>
                </div>
            </template>
        </b-overlay>
    </div>
</template>

<script>
    import Board from "./Board";
    export default {
        name: "game-screen",
        components: {
            Board
        },
        methods: {
            colorConvert(color) {
                if (color === "red") return "orangered"
                else if (color === "blue") return "dodgerblue"
                else return color
            },
            realColor(color) {
                return color === "red" || color === "blue";
            },
            confirmRestart() {
                this.$store.dispatch("clickRestart");
            },
            swapSide(side) {
                this.$store.dispatch("clickSwap", side);
            },
            prepareReady() {
                this.$store.dispatch("clickReady");
            },
            leaveRoom() {
                this.$store.dispatch("sendPacket", { type: "leave_room" })
            }
        },
        computed: {
            winner() {
                return this.$store.state.GameScreen.winner;
            },
            player_color() {
                return this.$store.state.GameScreen.player_color;
            },
            clicked_restart() {
                return this.$store.state.GameScreen.clicked_restart;
            },
            preparation() {
                return this.$store.state.GameScreen.preparation && this.player_color;
            },
            clicked_ready() {
                return this.$store.state.GameScreen.clicked_ready;
            },
            wait_left_swap() {
                return this.$store.state.GameScreen.wait_left_swap;
            },
            wait_right_swap() {
                return this.$store.state.GameScreen.wait_right_swap;
            }
        }
    }
</script>

<style scoped>
    #game-screen {
        width: 100vw;
        height: 100vh;
        background-color: #edebe9;
    }

    #spectator-leave-btn {
        position: absolute;
        top: 6px;
        left: calc(50% - 60px);
    }

    #finish-overlay, #overlay-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }

    #overlay-wrapper {
        flex-direction: column;
        margin-top: -80px;
        margin-left: 20px;
    }

    #preparation-cover {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
    }

    #preparation-background {
        width: 100%;
        height: 200px;
        margin-top: -60px;
    }

    #preparation-background:before{
        content:'';
        display:block;
        height:100%;
        opacity: 0.9;
        background: #edebe9;
        box-shadow: 0px 0px 80px 30px #888888;
    }

    #preparation-wrapper {
        width: 45%;
        position: relative;
        left: calc(27.5% + 35px);
        top: -120px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }

    #prep-ready-spinner {
        position: relative;
        top: -15px;
    }

    .prep-wrap-spinner {
        position: relative;
        top: -4px;
    }

    #prep-ready-text {
        position: relative;
        top: -140px;
        text-align: center;
        font-size: 50px;
    }

    .spinner {
        position: relative;
        left: 5px
    }

    .text {
        font-size: 60px;
    }
</style>
<template>
    <div id="wait-screen">
        <div id="background-wrapper">
            <span id="title">{{"Waiting for opponent"+dot_animation}}</span>
            <span id="wait-face">{{face ? face : ""}}</span>
            <div id=room-id>{{"Room: "+room_id}}</div>
            <div v-if="private_room">
                <div id="private-description">
                    <div>To invite your friends, get them to join by room code</div>
                    <div>or give them the url below:</div>
                </div>
                <b-input-group class="mt-3" size="lg">
                    <b-form-input readonly v-model="join_link" onclick="select()" />
                    <b-input-group-append>
                        <b-button @click="copyClipboard" variant="success" >
                            <b-icon icon="link"/>
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </div>
            <div v-else>
                <div id="public-description">
                    <div>There are currently no public available room, </div>
                    <div>a public room has been created so please wait</div>
                    <div>while we wait for a player to join</div>
                </div>
            </div>
        </div>
        <b-button pill id="cancel-btn" @click="leaveRoom" size="lg" variant="danger">
            <b-icon icon="x" />
            Leave
        </b-button>
    </div>
</template>

<script>
    import config from "../../config.json"
    import util from "../../utils.js"
    export default {
        name: "wait-screen",
        data() {
            return {
                domain: config.domain,
                dot_animation: "",
                face: false
            }
        },
        methods: {
            copyClipboard() {
                util.copyTextToClipboard(this.join_link);
            },
            leaveRoom() {
                this.$store.dispatch("leaveRoom");
            },
            runDotAnimation() {

                // Clear after an emote
                if (this.face) {
                    this.face = false;
                    this.dot_animation = "";
                }
                // When three dots, get an emote
                else if (this.dot_animation.length == 4) {
                    this.face = this.getFace();
                }
                else this.dot_animation += ".";

                setTimeout(this.runDotAnimation, 1000);
            },
            getFace() {
                return config.faces[Math.floor(Math.random() * config.faces.length)];
            }
        },
        computed: {
            private_room(){
                return this.$store.state.WaitScreen.private_room;
            },
            room_id() {
                return this.$store.state.WaitScreen.room_id;
            },
            join_link() {
                return this.domain+"/#"+this.room_id;
            }
        },
        created() {
            this.runDotAnimation();
        }
    }
</script>

<style scoped>
    #wait-screen {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #edebe9;
    }

    #background-wrapper {
        width: 650px;
        margin-top: -50px;
        background-color: white;
        box-shadow: 5px 10px 10px lightgray;
        border-radius: 5px;
        padding: 25px;
    }

    #title {
        font-weight:bold;
        font-size: 40px;
    }

    #wait-face {
        font-weight:bold;
        font-size: 26px;
    }

    #room-id {
        font-weight:bold;
        font-size: 20px;
        color: orange;
    }

    #private-description, #public-description, #cancel-btn {
        text-align: center;
        margin-top: 25px;
    }

    #public-description {

    }

    #cancel-btn {
    }

    input[readonly] {
        background-color: white;
    }
</style>
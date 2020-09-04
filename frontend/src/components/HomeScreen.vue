<template>
    <div id="home-screen">
        <div id="title">Jianggi</div>
        <b-overlay id="background-wrapper" :show="joining">
            <b-button
                id="play-btn"
                @click="clickButton('quick_start')"
                block
                size="lg"
                variant="success"
            >
                Play
            </b-button>
            <hr/>
            <b-form @submit.prevent="clickButton('join_room')">
                <b-input-group id="input" size="lg" prepend="#">
                    <b-form-input
                        id="room-input"
                        v-model="room_id"
                        prepend="#"
                        placeholder="Enter your room id . . ."
                    />
                </b-input-group>
            </b-form>
            <b-button
                class="room-buttons"
                @click="clickButton('join_room')"
                size="lg"
                variant="outline-primary"
            >
                Join Room
            </b-button>
            <b-button
                id="create-btn"
                class="room-buttons"
                @click="clickButton('create_room')"
                size="lg"
                variant="primary"
            >
                Create Private Room
            </b-button>
        </b-overlay>
        <div id="room-list">
            <div v-if="rooms.length">Connected Rooms: </div>
            <transition-group
                id="room-suggest-wrapper"
                name="custom-classes-transition"
                :duration="{ enter: 1000 , leave: 1000 }"
                enter-active-class="animated fadeInUpBig"
                leave-active-class="animated fadeOutDownBig"
            >
                <b-button
                    class="room-suggest"
                    pill
                    v-for="room in rooms"
                    @click="clickRoom(room)"
                    :variant="randomStyle()"
                    v-show="!joining"
                    :key="room"
                >
                    Room: {{room}}
                </b-button>
            </transition-group>
        </div>
    </div>
</template>

<script>
    export default {
        name: "home-screen",
        data() {
            return {
                room_id: ""
            }
        },
        methods: {
            clickButton(type) {
                switch(type) {
                    case "quick_start":
                        this.$store.dispatch("quickStart");
                        break;
                    case "join_room":
                        this.$store.dispatch("joinRoom", this.room_id.toUpperCase());
                        break;
                    case "create_room":
                        this.$store.dispatch("createRoom");
                        break;
                }
            },
            clickRoom(room_id) {
                this.room_id = room_id;
                this.clickButton("join_room");
            },
            randomStyle() {
                let style = ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark"]
                return style[Math.floor(Math.random() * style.length)]
            }
        },
        computed: {
            joining() {
                return this.$store.state.HomeScreen.joining;
            },
            rooms() {
                return this.$store.state.HomeScreen.rooms;
            }
        }
    }
</script>

<style scoped>
    #home-screen {
        width: 100vw;
        height: 100vh;
        display: flex;
        overflow: hidden;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #edebe9;
    }

    #title {
        width: 525px;
        margin-top: -50px;
        text-align: center;
        font-weight: bold;
        font-size: 90px;
        cursor: default;
        z-index: 1;
        letter-spacing: 5px;
    }

    #background-wrapper {
        width: 525px;
        background-color: white;
        box-shadow: 5px 10px 10px lightgray;
        border-radius: 5px;
        padding: 25px;
    }

    #room-list {
        width: 525px;
        height: 200px;
        margin-top: 25px;
    }

    #room-suggest-wrapper {
        width: 525px;
        height: 180px;
        overflow-y: auto;
    }

    #play-btn {
        margin-bottom: 25px;
        font-size: 30px;
    }

    #room-input {
        text-transform: uppercase;
    }

    #create-btn {
        margin-left: 25px;
    }

    .room-buttons {
        width: 225px;
    }

    #input, .room-buttons {
        margin-top: 25px;
    }

    .room-suggest {
        margin: 5px;
    }

    ::-webkit-input-placeholder { /* WebKit browsers */
        text-transform: none;
    }
    :-moz-placeholder { /* Mozilla Firefox 4 to 18 */
        text-transform: none;
    }
    ::-moz-placeholder { /* Mozilla Firefox 19+ */
        text-transform: none;
    }
    :-ms-input-placeholder { /* Internet Explorer 10+ */
        text-transform: none;
    }
    ::placeholder { /* Recent browsers */
        text-transform: none;
    }
</style>
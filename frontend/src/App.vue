<template>
    <div id="app">
        <home-screen v-if="screen == 'home'" />
        <wait-screen v-if="screen =='wait'" />
        <game-screen v-if="screen == 'game'" />
        <div id="alert-wrapper">
            <b-alert
                class="alerts"
                v-for="(alert, id) in local_alerts"
                :show="true"
                :key="id"
                :variant="alert.type"
                @dismissed="dismissAlert(id)"
                dismissible

                fade
            >
                {{alert.message}}
            </b-alert>
        </div>
    </div>
</template>

<script>
    import HomeScreen from "./components/HomeScreen";
    import WaitScreen from "./components/WaitScreen";
    import GameScreen from "./components/GameScreen";
    import utils from "../utils.js";
    export default {
        name: "app",
        components: {
            HomeScreen,
            WaitScreen,
            GameScreen
        },
        data() {
            return {
                dismissSecs: 5000,
                local_alerts: {}
            }
        },
        methods: {
            refreshAlerts() {
                let temp = {};
                for (let key in this.local_alerts) {
                    temp[key] = this.local_alerts[key];
                }
                this.local_alerts = temp;
            },
            dismissAlert(alert_id) {
                delete this.local_alerts[alert_id];
                this.refreshAlerts();
            }
        },
        computed: {
            screen() {
                return this.$store.state.screen;
            },
            alerts() {
                return this.$store.state.alerts;
            }
        },
        watch: {
            alerts(new_value) {
                while (new_value.length) {
                    let alert = new_value.pop(),
                        id = utils.ID();

                    let that = this;
                    this.local_alerts[id] = alert;
                    alert.timmer = setTimeout(() => {
                        that.dismissAlert(id);
                    }, this.dismissSecs)
                }
                this.refreshAlerts();
            }
        },
        created() {
            this.$store.dispatch("listenResize");
        }
    }
</script>

<style scoped>
    #alert-wrapper {
        width: 100%;
        position: absolute;
        top: 0px;
    }

    .alerts {
        width: 100%;
    }
</style>
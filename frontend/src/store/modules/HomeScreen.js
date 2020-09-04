export default {
    state: {
        joining: false,
        rooms: []
    },
    actions: {
        quickStart: ({ dispatch, commit }) => {
            commit("setJoining", true)
            dispatch("sendPacket", {
                type: "quick_join"
            });
        },
        joinRoom: ({ dispatch, commit }, room_id) => {
            commit("setJoining", true)
            dispatch("sendPacket", {
                type: "join_room",
                id: room_id
            });
        },
        createRoom: ({ dispatch, commit }) => {
            commit("setJoining", true)
            dispatch("sendPacket", {
                type: "create_room"
            })
        }
    },
    mutations: {
        setJoining: (state, is_joining) => {
            state.joining = is_joining;
        },
        resetHomeScreen: (state) => {
            state.joining = false;
        },
        setRooms: (state, rooms) => {
            state.rooms = rooms;
        }
    }
}
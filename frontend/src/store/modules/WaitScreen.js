export default {
    state: {
        private_room: false,
        room_id: false
    },
    actions: {
        leaveRoom: ({ dispatch }) => {
            dispatch("sendPacket", {
                type: "leave_room"
            })
        }
    },
    mutations: {
        setWaitScreen: (state, { private_room, room_id }) => {
            state.private_room = private_room;
            state.room_id = room_id;
        },
        resetWaitScreen: (state) => {
            state.private_room = false;
            state.room_id = false;
        }
    }
}
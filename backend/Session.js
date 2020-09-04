import Crypto from "crypto";

export default class Session {

    // Each session will be denoted by
    // key: session_id
    // value: { id, ip, rooms[] }
    static SESSIONS = {};

    constructor(ip) {

        // Create a new session with random id
        this.id = Crypto.randomBytes(20).toString("hex");
        this.ip = ip;
        this.rooms = [];

        // Add the session to global list
        Session.SESSIONS[this.id] = this;
    }

    addRoom(room_id) {
        this.rooms.push(room_id);
    }

    delRoom(room_id) {
        let index = this.rooms.indexOf(room_id);
        if (index > -1) {
            this.rooms.splice(index, 1);
        }
    }

    static getSession(session_id) {
        return this.SESSIONS[session_id];
    }

    // Validates the given session values,
    // returning true if session does exist
    static validateSession(session_id, req_ip) {
        if (session_id === undefined) return false;
        else if (!(session_id in this.SESSIONS)) return false;
        else if (this.SESSIONS[session_id].ip !== req_ip) return false;
        else return true;
    }
}
const selectPiece = ({ commit }, { piece, position }) => {
	// Calls the mutation version, where
	// the game has the piece selected

	// Timing is to ensure any clicks will
	// go in the order of
	// click-move -> click-unselect -> click-select
	setTimeout(
() => commit("selectPiece", { piece, position }),
100
	)
}

const unselectPiece = ({ commit }) => {
	// Calls the mutation version, where
	// information about currently
	// selected is emptied

	// Timing is to ensure any clicks will
	// go in the order of
	// click-move -> click-unselect -> click-select
	setTimeout(
() => commit('unselectPiece'),
50
	)
}

const movePiece = ({ state, dispatch }, to_pos) => {
	dispatch("sendPacket", {
		type: "move_piece",
		from: state.selecting_position,
		to: to_pos
	});
}

const clickRestart = ({ dispatch, commit }) => {
	commit("clickRestart");
	dispatch("sendPacket", {type: "restart_ready"});
}

const clickSwap = ({ dispatch, commit }, side) => {
	commit("setSwap", {
		side: side,
		wait: true
	});
	dispatch("sendPacket", {
		type: "swap_piece",
		side: side
	})
}

const clickReady = ({ dispatch, commit }) => {
	commit("setReady", true);
	dispatch("sendPacket", {type:"prepare_ready"});
}

export default {
    selectPiece,
    unselectPiece,
	movePiece,
	clickRestart,
	clickSwap,
	clickReady
}
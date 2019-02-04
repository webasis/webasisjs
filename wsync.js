import ReconnectingWebSocket from "./reconnecting-websocket";

function client(url, token) {
	if (url == "") {
		return
	}
	let ws = new ReconnectingWebSocket(url, null, {
		maxReconnectInterval: 3000,
		reconnectDecay: 1.0,
	});
	let connected = false;
	var onMessage = (e) => {
		console.log("default onMessage:", e)
	};
	var onOpen = () => {};

	function getOnMessage() {
		return onMessage
	}

	function getOnOpen() {
		return onOpen
	}


	let send = (...raw) => {
		ws.send(raw.join("\x1F"))
	}

	ws.onopen = () => {
		connected = true;
		send("A", token);
		(getOnOpen())();
	};
	ws.onclose = () => {
		connected = false;
	};
	ws.onmessage = evt => {
		const raw = evt.data.split("\x1F")
		let method, topic = ""
		let metas = [];
		if (raw.length > 0) {
			method = raw[0];
		}
		if (raw.length > 1) {
			topic = raw[1];
		}
		if (raw.length > 2) {
			metas = raw.slice(2);
		}

		if (method == "P") {
			send("p");
			return
		}

		(getOnMessage())({
			method,
			topic,
			metas
		})
	};

	return {
		setOnMessage: function (fn) {
			onMessage = fn;
		},
		AfterOpen(fn) {
			onOpen = fn;
			if (connected) {
				fn();
			}
		},
		connected: () => {
			return connected;
		},
		send,
		close: () => {
			ws.close();
		}
	};
}

export default {
	client
}
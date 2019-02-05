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

	function getOnMessage() {
		return onMessage
	}

	let subTopics = [];

	let send = (...raw) => {
		ws.send(raw.join("\x1F"))
	}

	ws.onopen = () => {
		connected = true;
		send("A", token);
		subTopics.forEach(topic => {
			send("S", topic)
		})
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

		if (method == "p") {
			send("P");
			return
		}

		if (method == "t") {
			if (!subTopics.includes(topic)) {
				send("U", topic);
				return
			}
			(getOnMessage())({
				topic,
				metas
			})
		}
	};

	return {
		on: function (fn) { // { topic,metas}
			onMessage = fn;
		},
		sub(...topics) {
			subTopics = topics;
			if (connected) {
				subTopics.forEach(topic => {
					send("S", topic)
				})
			}
		},
		connected() {
			return connected;
		},
		send,
		unsub() {
			subTopics.forEach(topic => {
				send("U", topic)
			})
			subTopics = [];
		}
	};
}

export default {
	client
}
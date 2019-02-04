const Prefix = "webasis_"

function set(key, value) {
	if (key == "") {
		return
	}
	key = Prefix + key
	if (window.localStorage) {
		window.localStorage.setItem(key, value);
	}
}

function get(key, value) {
	key = Prefix + key
	let ret = "";
	if (window.localStorage) {
		ret = window.localStorage.getItem(key);
	}
	if (ret == null || ret == "") {
		ret = value;
	}
	return ret;
}

function map(fn) { // function(k,v)
	if (window.localStorage) {
		let ls = window.localStorage.valueOf();
		return Object.keys(ls)
			.filter(k => k.startsWith(Prefix))
			.map(k => {
				let v = window.localStorage.getItem(k)
				k = k.substring(Prefix.length)
				return fn(k, v)
			})
	}
	return []
}

function rm(key) {
	if (window.localStorage) {
		window.localStorage.removeItem(Prefix + key)
	}
}

function marshal() {
	return JSON.stringify(map((k, v) => {
		return {
			key: k,
			value: v
		}
	}));
}

function load(raw) {
	JSON.parse(raw).forEach(item => {
		set(item.key, item.value)
	})
}

export default {
	get,
	set,
	map,
	rm,
	marshal,
	load,
};
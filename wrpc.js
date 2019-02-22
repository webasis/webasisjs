const UnitSep = "\x1f"

export default {
	client(url, token) {
		if (url == "") {
			return
		}
		let onAuth = () => {}
		let onIErr = () => {}
		let onBan = () => {}

		return {
			setOnAuth(fn) {
				onAuth = fn
			},
			setOnIErr(fn) {
				onIErr = fn
			},
			setOnBan(fn) {
				onBan = fn
			},
			name() {
				const items = atob(token).split("\x1f");
				let name = ""
				if (items.length > 0) {
					name = items[0]
				}
				return name
			},
			call(method, ...args) {
				return new Promise((resolve, reject) => {
					fetch(url, {
							method: 'POST',
							body: [token, method, ...args].join(UnitSep),
							mode: 'cors',
						}).then(resp => resp.text())
						.then(raw => {
							let data = raw.split(UnitSep)
							let status = data[0]
							let rets = data.slice(1)

							let ret = {
								status,
								rets
							}
							switch (status) {
								case 'ok':
									resolve(ret)
									return
								case 'auth':
									onAuth(ret)
									break
								case 'ierr':
									onIErr(ret)
									break
								case 'ban':
									onBan(ret)
									break
								default:
							}
							reject(ret) // must handle 'err'
						})
						.catch(e => {
							let ret = {
								status: 'ierr',
								rets: ["client error", e.message],
							}
							onIErr(ret)
							reject(ret)
						})
				})

			}
		}
	}
}
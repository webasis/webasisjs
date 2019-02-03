const UnitSep = "\x1f"

export default {
	client(url,token) {
		return {
			call(method,args...) {
				fetch(url,{
					method:'POST',
					body:[method,args...].join(UnitSep),
					mode: 'cors',
				}).then(resp=>{
					let data = resp.text().split(UnitSep)
					console.log(data)
				}).catch(e=>{
					console.log(e)
				})
			}
		}
	}
}

const ajax = new XMLHttpRequest()
ajax.onreadystatechange = function() {
	const { readyState, status } = ajax
	if(readyState===4&&status===200) {
		const { responseText } = ajax
		console.log(responseText)
	}
}

ajax.open('GET','https://api.ourfor.top')
ajax.send()
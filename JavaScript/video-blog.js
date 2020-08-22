clear()
function ajax(url, create) {
	const xhr = new XMLHttpRequest()
	xhr.onload = () => create(xhr.response)
	xhr.responseType = "blob"
	xhr.open('get',url)
	xhr.send()
}

// <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
function request(url, create) {
	axios.get(url,{ responseType: 'blob' })
		.then(({data}) => create(data))	
}

request('https://static.ourfor.top/video/friend.mp4', function(res){
    const src = URL.createObjectURL(res)
    const video = document.createElement('video')
    video.src = src
    document.body.innerHTML = ""
    document.body.append(video)
})


function menu() {
	const content = document.querySelector('#jsContent') 
	const menu = document.querySelector('#jsMenu')
	if(!content.hasChildNodes()) {
		content.classList = ["no-header"]
		menu.style.display = "none"
	} else menu.innerHTML = `<ul>${toc(content)}</ul>`
}

function toc(headers) {
	const titles = headers.querySelectorAll('h1,h2,h3,h4,h5,h6')
	const list = [...titles]
	const content = list.map(({tagName: tag, innerText: text}) => `<li><a href="#" class="${tag.toLowerCase()}">${text}</a></li>`)
	return content.join('')
}
menu()

((\S+)(\/.*)(\(\.*?\))|(\S+)(\/.*))
/\(.*?\)/
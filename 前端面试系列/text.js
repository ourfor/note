function qsort(array) {
	const len = array.length
	if(len>1) {
		const middle = array.splice(len/2,1)[0];
		const left = [];
		const right = [];
		array.forEach((item) => item>middle?right.push(item):left.push(item))
		return [...qsort(left),middle,...qsort(right)]
	} else {
		return array
	}
}

function shuffle(array) {
	const len = array.length;
	array.forEach((_,index) => {
		const rand = Math.floor(Math.random()*len);
		[array[index],array[rand]] = [array[rand],array[index]]
	})
	return array
}

// 正则表达式应用 nice-to-meet-you => NiceToMeetYou
const str = "nice-to-meet-you"
str.toLowerCase().replace(/-?(\b\w)/g,(_,$1) => $1.toUpperCase())
const result = '-'.concat(str).replace(/-(\b\w)/g,(_,$1) => $1.toUpperCase())
console.log(result)
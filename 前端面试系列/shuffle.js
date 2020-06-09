// 洗牌算法
function shuffle(array = []) {
	const len = array.length
	for(let i=0;i<len;i++) {
		const rand = Math.floor(Math.random() * len);
		[array[i], array[rand]] = [array[rand], array[i]]
	}
	return array
}
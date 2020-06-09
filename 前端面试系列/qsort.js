function qsort(array,len=array.length-1) {
	if(len<=0) return array
	const middle = array.splice(Math.floor(len/2),1)[0]
	const left = [], right = []
	array.forEach(v => v<=middle?left.push(v):right.push(v))
	return [...qsort(left),middle,...qsort(right)]
}

const array = [1,3,68,20,2,4,1,0,20]
const result = qsort(array)
console.log(result)
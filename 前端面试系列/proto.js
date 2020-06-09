Object.prototype.name = 'obj'
Function.prototype.name = 'func'
function People() {
}
const func = People()
const obj = new People()
console.log(obj.name)
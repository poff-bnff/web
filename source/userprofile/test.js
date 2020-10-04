

let date = new Date()
let date1= date.setFullYear( date.getFullYear() - 1 )

let minAge = ((date.getMonth()+1 ) + '-' + (date.getDate()) + '-' + (date.getFullYear()-12))
let maxAge = ((date.getMonth()+1 ) + '-' + (date.getDate()) + '-' + (date.getFullYear()-112))

// console.log(minAge);
// console.log(maxAge);

let name= 'tere'
// console.log(!isNaN(name));

if(name.length > 2){
    // console.log(true);
}
let phoneNr = '+123 456 78 901'
let phoneNr = '+123 456 78 901'
let phoneNr1 = '499: 8 499 345-34-23'
let phoneNr2 = '(555) 555-1234'
let phoneNr3 = '1-234-567-8901'
let phoneNr4 = '1-234-567-8901 ext1234'
let phoneNr5 = '1.234.567.8901'
const regex = /^(?:\+\d{1,3}|0\d{1,3}|00\d{1,2})?(?:\s?\(\d+\))?(?:[-\/\s.]|\d)+$/
console.log('number');
console.log('1', regex.test(String( phoneNr).toLowerCase()))
console.log('2', regex.test(String( phoneNr1).toLowerCase()))
console.log('3', regex.test(String( phoneNr2).toLowerCase()))
console.log('4', regex.test(String(phoneNr3).toLowerCase()))
console.log('5', regex.test(String(phoneNr4).toLowerCase()))
console.log('6', regex.test(String(phoneNr5).toLowerCase()))

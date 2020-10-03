

let date = new Date()
let date1= date.setFullYear( date.getFullYear() - 1 )

let minAge = ((date.getMonth()+1 ) + '-' + (date.getDate()) + '-' + (date.getFullYear()-12))
let maxAge = ((date.getMonth()+1 ) + '-' + (date.getDate()) + '-' + (date.getFullYear()-112))

// console.log(minAge);
// console.log(maxAge);

let name= 'tere'
console.log(!isNaN(name));

if(name.length > 2){
    console.log(true);
}

const fs = require('fs');
const path = require('path');

const stylesFolder =  path.join(__dirname, '../source/_styles/');

if (process.env['DOMAIN'] === 'justfilm.ee') {
    var stylesFolderSource = path.join(__dirname, '../source/_styles_templates/_styles_justfilm/');
} else if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    var stylesFolderSource = path.join(__dirname, '../source/_styles_templates/_styles_shorts/');
} else {
    var stylesFolderSource = path.join(__dirname, '../source/_styles_templates/_styles_poff/');
}

fs.unlinkSync(stylesFolder, err=>{
    if(!err){
        console.log(stylesFolder+" has been deleted!");
    }
});
// fs.mkdirSync(stylesFolder, err=>{
//     if(!err){
//         console.log(stylesFolder+" has been re-created!");
//     }
// });

// fs.readdir(stylesFolderSource, function (err, files) {
//     //handling error
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     }
//     //listing all files using forEach
//     files.forEach(function (file) {

//         fs.copyFile(`${stylesFolderSource}${file}`, `${stylesFolder}${file}`, err=>{
//             if(!err){
//                 console.log(file+" has been copied!");
//             }
//         });
//     });
// });

// // files.forEach(file => {
// //     let basename = path.basename(file);
// //     let oldFile = path.join(__dirname+file);
// //     let newFile = path.join(__dirname+'/files/backup/'+basename);
// //     if (!fs.existsSync(newFile)) {
// //         fs.copyFile(oldFile, newFile, err=>{
// //     if(!err){
// //         console.log(basename+" has been copied!");
// //     }
// // });
// // }else{
// // console.log(basename+" already existed!");
// // }
// // });

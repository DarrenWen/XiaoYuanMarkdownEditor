var fs = require("fs");

function openFile(path){
    var data = fs.readFileSync(path);
    return data.toString();
}


function saveFile(path,data){
    fs.writeFileSync(path, data);
}
module.exports = {openFile,saveFile};
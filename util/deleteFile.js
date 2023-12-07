const path = require('path');
const fs = require('fs');

module.exports = (deletionPath) => {
    fs.unlink(path.join(__dirname,'..', deletionPath), err => {
        if(err)
        console.log(err)
    });
}
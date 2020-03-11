/**
 * lowdb操作
 */
var initObj = {
    initStatus: true,
    recentFiles: [],
    workspace: {
        path: '',
        fileName: '',
        data: '',
        edit: false
    }
}
const file = 'db.json';
let low = require('lowdb')
let FileSync = require('lowdb/adapters/FileSync')

let adapter = new FileSync(file)
let db = low(adapter)
module.exports = {
    init: function(){
        let status = db.get('initStatus').value();
        if(!status){
            db.defaults(initObj)
            .write()
        }
    },
    getWorkspace: function(){
        return db.get('workspace').value();
    },
    saveWorkspace: function(workspace){
        db.update('workspace', workspace)
        .write()
    },
    addRecentFile: function(fileName, path){
        let files = db.get('recentFiles').value();
        let exist = false;
        for(let i=0;i<files.length;i++){
            if(files[i].fileName === fileName && files[i].path === path){
                exist = true;
                break;
            }
        }
        if(!exist){
            db.get('recentFiles')
            .push({ fileName: fileName, path: path})
            .write()
        }
    },
    getRecentFiles: function(){
        return db.get('recentFiles').value();
    },
    updateRecentFiles: function(files){
        db.update('recentFiles', files)
        .write()
    }
}
/**
 * 状态控制
 */
const fs = require('fs');
module.exports = {
    workspace: {
        path: '',
        fileName: '',
        data: '',
        edit: false
    },
    init(db){
        this.db = db;
        this.workspace = this.db.getWorkspace();
    },
    changeEdit: function(edit){
        this.workspace.edit = edit;
    },
    changeData: function(data){
        if(this.workspace.data !== data){
            this.workspace.data = data;
            this.workspace.edit = true;
            return true;
        }else{
            return false;
        }
    },
    changeFile: function(path, fileName){
        this.workspace.path = path;
        this.workspace.fileName = fileName;
    },
    saveWorkspace: function(){
        if(this.db){
            this.workspace.edit = false;
            this.db.saveWorkspace(this.workspace);
        }
    },
    addRecentFile: function(fileName, path){
        if(this.db){
            this.db.addRecentFile(fileName, path);
        }
    },
    getRecentFiles: function(){
        let result = [];
        if(this.db){
            let files = this.db.getRecentFiles();
            for(let i=0;i<files.length;i++){
                if(fs.existsSync(files[i].path)){
                    result.push(files[i]);
                }
            }
            if(files.length !== result.length){
                this.db.updateRecentFiles(result);
            }
        }
        return result;
    }
}
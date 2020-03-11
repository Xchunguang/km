/**
 * 主线程与渲染线程消息通讯
 * 拟定所有通讯都是由渲染线程发出，主线程返回内容，主线程类似服务
 */
const {ipcMain,dialog} = require('electron');

module.exports = {
    init: function(status){
        this.status = status;
        ipcMain.on('render-message', (event, arg) => {
            if(arg && arg.type){
                switch(arg.type){
                    case 'test':
                        console.log('receive ' + arg.data);
                        event.returnValue = 'pong';
                        break;
                    case 'changeData':
                        event.returnValue = this.status.changeData(arg.data);
                        break;
                    case 'getData':
                        event.returnValue = this.status.workspace.data;
                        break;
                    case 'getEdit':
                        event.returnValue = this.status.workspace.edit;
                        break;
                    case 'setEdit':
                        this.status.workspace.edit = arg.data;
                        event.returnValue = 'ok';
                        break;
                    case 'getFileName':
                        event.returnValue = this.status.workspace.fileName;
                        break;
                    case 'getPath':
                        event.returnValue = this.status.workspace.path;
                        break;                        
                    case 'saveWorkspace':
                        this.status.saveWorkspace();
                        event.returnValue = 'ok';
                        break;
                    case 'showErr':
                        dialog.showErrorBox('发生错误',arg.data)
                        event.returnValue = 'ok';
                        break;
                    case 'checkCanOpenFile':
                        if(this.status){
                            if(this.status.workspace.edit){
                                const options = {
                                    type: 'info',
                                    title: '是否继续',
                                    message: "当前尚未保存，是否继续?",
                                    buttons: ['继续', '取消']
                                }
                                let index = dialog.showMessageBoxSync(options);
                                if(index === 0){
                                    event.returnValue = true;
                                }else{
                                    event.returnValue = false;
                                }
                            }else{
                                event.returnValue = true;
                            }
                        }else{
                            event.returnValue = true;
                        }
                        break;
                    case 'openFile':
                        if(this.status){
                            this.status.workspace.edit = false;
                            this.status.workspace.fileName = arg.data.fileName;
                            this.status.workspace.data = arg.data.data;
                            this.status.workspace.path = arg.data.path;
                            this.status.saveWorkspace();
                            if(arg.data.fileName && arg.data.fileName.length > 0 && arg.data.path && arg.data.path.length > 0){
                                this.status.addRecentFile(arg.data.fileName, arg.data.path);
                            }
                        }
                        event.returnValue = 'ok';
                        break;
                    case 'getRecentFiles':
                        event.returnValue = this.status.getRecentFiles();
                        break;
                    default: 
                }
            }
        })
    }
}
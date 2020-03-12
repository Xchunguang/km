const defaultEditor = {"root":{"data":{"id":"c17tsgo7etc0","created":1583911566920,"text":"中心主题"},"children":[]},"template":"default","theme":"fresh-blue","version":"1.4.43"};
function base64ToBlob(urlData, type) {
    let arr = urlData.split(',');
    let mime = arr[0].match(/:(.*?);/)[1] || type;
    let bytes = window.atob(arr[1]);
    let ab = new ArrayBuffer(bytes.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i);
    }
    return new Blob([ab], {
        type: mime
    });
}
angular.module('kityminderEditor')
    .directive('kmHeader', ['config', 'minder.service', function(config, minderService) {
        return {
            restrict: 'EA',
            templateUrl: 'ui/directive/kmheader/kmheader.html',
            replace: true,
            scope: {
                onInit: '&'
            },
            link: function(scope, element, attributes) {
                var js = `
                const {ipcRenderer,remote} = require('electron');
                const dialog = remote.dialog
                const fs = require('fs');
                const path = require('path');
                this.addCloseListener = false;

                var changeTitle = function(){
                    let edit = ipcRenderer.sendSync('render-message', {type: 'getEdit'});
                    let fileName = ipcRenderer.sendSync('render-message', {type: 'getFileName'});
                    let title = '';
                    if(edit){
                        title += ' * ';
                    }
                    if(fileName && fileName.length > 0){
                        title += fileName + ' - ';
                    }
                    title += '思维导图';
                    document.title = title;
                }
                scope.openMenu = function(){
                    console.log('hello');
                }
                scope.edit = false;
                scope.editName = "编辑";
                scope.tiggetEdit = function(){
                    if(scope.edit){
                        scope.edit = false;
                        scope.editName = "编辑";
                        if(editor){
                            editor.selector.style.top = '0px';
                        }
                    }else{
                        scope.edit = true;
                        scope.editName = "预览";
                        if(editor){
                            editor.selector.style.top = '92px';
                        }
                    }
                }
                scope.names = ['新建','打开','另存为','关于'];
                scope.currentItem = '打开';
                scope.clickItem = function(x){
                    if(x === '新建'){
                        let canOpenFile = ipcRenderer.sendSync('render-message', {type: 'checkCanOpenFile'});
                        if(canOpenFile){
                            let fileObj = {
                                fileName: '',
                                data: '',
                                path: ''
                            }
                            ipcRenderer.sendSync('render-message', {type: 'openFile',data: fileObj});
                            if(editor){
                                editor.minder.importJson(defaultEditor);
                            }
                            changeTitle();
                            //隐藏菜单
                            scope.hideMenu();
                        }
                    }else{
                        scope.currentItem = x;
                    }
                }
                scope.showMenuFunc = function(e){
                    scope.showMenu = true;
                    if(!this.addCloseListener){
                        if(editor){
                            editor.container.addEventListener('click', function(){
                                scope.hideMenu();
                            });
                            this.addCloseListener = true;
                        }
                    }
                }
                scope.hideMenu = function(){
                    scope.showMenu = false;
                    scope.$apply();
                }
                //加载文件方法，参数为文件的绝对路径
                var loadFile = function(file){
                    fs.stat(file, (err, statdata) => {
                        fs.readFile(file, 'utf-8', (err, data) => {
                            let oriJson = editor.minder.exportJson();
                            try{
                                let fileObj = {
                                    fileSize: statdata.size,
                                    fileName: path.basename(file),
                                    extName: path.extname(file),
                                    data: data,
                                    path: file
                                }
                                if(editor){
                                    editor.minder.importJson(JSON.parse(data));
                                }
                                //刷新工作区
                                ipcRenderer.sendSync('render-message', {type: 'openFile',data: fileObj});
                                //隐藏菜单
                                scope.hideMenu();
                                //加载最近文件
                                scope.files = ipcRenderer.sendSync('render-message', {type: 'getRecentFiles'});
                                //更新title
                                changeTitle();
                            }catch(e){
                                //打开文件失败
                                editor.minder.importJson(oriJson);
                                ipcRenderer.sendSync('render-message', {type: 'showErr', data: '文件解析失败!'});
                            }
                        })
                    })
                }
                scope.openFile = function(){
                    let canOpenFile = ipcRenderer.sendSync('render-message', {type: 'checkCanOpenFile'});
                    if(canOpenFile){
                        dialog.showOpenDialog({
                            title: '选择文件',
                            properties: ['openFile'],
                            filters: [
                                { name: '思维导图', extensions: ['km', 'json'] }
                            ]
                        }).then(result => {
                            if(!result.canceled && result.filePaths && result.filePaths.length > 0){
                                let file = result.filePaths[0];
                                loadFile(file);
                            }
                          }).catch(err => {
                            console.log(err)
                          });
                    }
                }
                scope.openRecentFile = function(x){
                    let canOpenFile = ipcRenderer.sendSync('render-message', {type: 'checkCanOpenFile'});
                    if(canOpenFile){
                        let filePath = ipcRenderer.sendSync('render-message', {type: 'getPath'});
                        if(filePath !== x.path){
                            loadFile(x.path);
                        }else{
                            //隐藏菜单
                            scope.hideMenu();
                        }
                    }
                }
                var writeToFile = function(path, json){
                    fs.writeFile(path,json,function (err) {
                        if(err){
                            console.log(err);
                        }else{
                            console.log("file success！！！")
                        }
                    })
                }
                scope.saveAsNewFile = function(){
                    let data = '';
                    if(editor && editor.minder){
                        data = JSON.stringify(editor.minder.exportJson());
                    }
                    const options = {
                        title: '保存思维导图',
                        filters: [
                            { name: '思维导图', extensions: ['km', 'json'] }
                        ]
                    }
                    dialog.showSaveDialog(options)
                    .then(result => {
                        if(!result.canceled){
                            let savePath = result.filePath;
                            let fileObj = {
                                fileName: path.basename(savePath),
                                data: data,
                                path: savePath
                            }
                            //写入文件
                            writeToFile(savePath, data);
                            //刷新工作区
                            ipcRenderer.sendSync('render-message', {type: 'openFile',data: fileObj});
                            //加载最近文件
                            scope.files = ipcRenderer.sendSync('render-message', {type: 'getRecentFiles'});
                            //更新title
                            changeTitle();
                            //隐藏菜单
                            scope.hideMenu();
                        }
                    })
                }
                scope.saveFunc = function(){
                    let filePath = ipcRenderer.sendSync('render-message', {type: 'getPath'});
                    if(filePath && filePath.length > 0){
                        let data = '';
                        if(editor && editor.minder){
                            data = JSON.stringify(editor.minder.exportJson());
                        }
                        writeToFile(filePath, data);
                        ipcRenderer.sendSync('render-message', {type: 'setEdit',data: false});
                        //更新title
                        changeTitle();
                    }else{
                        scope.saveAsNewFile();
                    }
                }
                scope.saveAsMd = function(){
                    if(editor && editor.minder){
                        editor.minder.exportData('markdown').then(text => {
                            const options = {
                                title: '另存为markdown',
                                filters: [
                                    { name: '思维导图', extensions: ['md'] }
                                ]
                            }
                            dialog.showSaveDialog(options)
                            .then(result => {
                                if(!result.canceled){
                                    let savePath = result.filePath;
                                    //写入文件
                                    writeToFile(savePath, text);
                                    //隐藏菜单
                                    scope.hideMenu();
                                }
                            })
                        })
                    }
                }
                scope.saveAsSvg = function(){
                    if(editor && editor.minder){
                        editor.minder.exportData('svg').then(text => {
                            const options = {
                                title: '另存为svg',
                                filters: [
                                    { name: '思维导图', extensions: ['svg'] }
                                ]
                            }
                            dialog.showSaveDialog(options)
                            .then(result => {
                                if(!result.canceled){
                                    let savePath = result.filePath;
                                    //写入文件
                                    writeToFile(savePath, text);
                                    //隐藏菜单
                                    scope.hideMenu();
                                }
                            })
                        })
                    }
                }
                scope.saveAsPng = function(){
                    if(editor && editor.minder){
                        editor.minder.exportData('png').then(text => {
                            const options = {
                                title: '另存为png',
                                filters: [
                                    { name: '思维导图', extensions: ['png'] }
                                ]
                            }
                            dialog.showSaveDialog(options)
                            .then(result => {
                                if(!result.canceled){
                                    let savePath = result.filePath;
                                    let type = 'image/png';

                                    //写入文件
                                    var blob = base64ToBlob(text, type);
                                    blob.arrayBuffer().then(buffer => {
                                        writeToFile(savePath, new Int8Array(buffer));
                                        //隐藏菜单
                                        scope.hideMenu();
                                    })
                                }
                            })
                        })
                    }
                }

                //开始加载
                scope.files = ipcRenderer.sendSync('render-message', {type: 'getRecentFiles'});
                
                changeTitle();
                `;
                //以上代码不参与编译，所以采用该方式
                eval(js);
            }
        }
    }]);
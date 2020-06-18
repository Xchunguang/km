angular.module('kityminderEditor')

	.directive('noteEditor', ['valueTransfer', function(valueTransfer) {
		return {
			restrict: 'A',
			templateUrl: 'ui/directive/noteEditor/noteEditor.html',
			scope: {
				minder: '='
			},
            replace: true,
			controller: function($scope) {
				var minder = $scope.minder;
				var isInteracting = false;
				var cmEditor;

				$scope.fullScreen = false;
				$scope.changeFullScreen = function(status){
					$scope.fullScreen = status;
				}
				var insertValue = function(value){
					$scope.noteContent += value;
					$scope.$apply();
				}
				$scope.insertPicture = function(){
					let re = new RegExp("\\\\","g");
					var js = `
					const {ipcRenderer,remote} = require('electron');
               		const dialog = remote.dialog;					
					let canDo = ipcRenderer.sendSync('render-message', {type: 'checkInsertPicture'});
					if(canDo){
						dialog.showOpenDialog({
                            title: '选择文件',
                            properties: ['openFile'],
                            filters: [
								{ name: '图片', extensions: ['jpg', 'png'] },
								{ name: '所有文件', extensions: ['*'] }
                            ]
                        }).then(result => {
							if(!result.canceled && result.filePaths && result.filePaths.length > 0){
								let file = result.filePaths[0];
								let res = ipcRenderer.sendSync('render-message', {type: 'insertPicture', path: file});
								insertValue('![img](file:///'+res.replace(re,'/')+')');
							}
						}).catch(err => {
							console.log(err)
						});
					}
					`;
					eval(js);
				}

				$scope.codemirrorLoaded =  function(_editor) {

					cmEditor = $scope.cmEditor = _editor;

					_editor.setSize('100%', '100%');
				};

				function updateNote() {
					var enabled = $scope.noteEnabled = minder.queryCommandState('note') != -1;
					var noteValue = minder.queryCommandValue('note') || '';

					if (enabled) {
						$scope.noteContent = noteValue;
					}

					isInteracting = true;
					$scope.$apply();
					isInteracting = false;
				}


				$scope.$watch('noteContent', function(content) {
					var enabled = minder.queryCommandState('note') != -1;

					if (content && enabled && !isInteracting) {
						minder.execCommand('note', content);
					}

					setTimeout(function() {
						cmEditor.refresh();
					});
				});


                var noteEditorOpen = function() {
                    return valueTransfer.noteEditorOpen;
                };

                // 监听面板状态变量的改变
                $scope.$watch(noteEditorOpen, function(newVal, oldVal) {
                    if (newVal) {
                        setTimeout(function() {
                            cmEditor.refresh();
                            cmEditor.focus();
                        });
                    }
                    $scope.noteEditorOpen = valueTransfer.noteEditorOpen;
                }, true);


                $scope.closeNoteEditor = function() {
                    valueTransfer.noteEditorOpen = false;
					editor.receiver.selectAll();
                };



				minder.on('interactchange', updateNote);
			}
		}
	}]);
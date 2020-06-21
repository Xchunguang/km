// TODO: 使用一个 div 容器作为 previewer，而不是两个
angular.module('kityminderEditor')

	.directive('notePreviewer', ['$sce', 'valueTransfer', function($sce, valueTransfer) {
		return {
			restrict: 'A',
			templateUrl: 'ui/directive/notePreviewer/notePreviewer.html',
			link: function(scope, element) {
				var minder = scope.minder;
				var $container = element.parent();
				var $previewer = element.children();
				scope.showNotePreviewer = false;
				scope.fullScreen = false;
				scope.changeFullScreen = function(fullState){
					scope.fullScreen = fullState;
					if(fullState){
						scope.previewerStyle = {
							'width': '90%',
							'height': '90%',
							'left': '5%',
							'top': '3%',
							'z-index': 2002,
							'max-width': '100%',
							'max-height': '100%'
						};
					}else{
						if(scope.styleCopy){
							scope.previewerStyle = JSON.parse(JSON.stringify(scope.styleCopy));
						}
					}
					scope.showNotePreviewer = true;
				}

				marked.setOptions({
                    gfm: true,
                    tables: true,
                    breaks: true,
                    pedantic: false,
                    sanitize: true,
                    smartLists: true,
                    smartypants: false
                });


				var previewTimer;
				minder.on('shownoterequest', function(e) {

					previewTimer = setTimeout(function() {
						preview(e.node, e.keyword, e.ifMax);
					}, 200);
				});
				minder.on('hidenoterequest', function() {
					clearTimeout(previewTimer);

                    scope.showNotePreviewer = false;
                    //scope.$apply();
				});

				var previewLive = false;
				$(document).on('mousedown mousewheel DOMMouseScroll', function() {
					if (!previewLive) return;
					scope.showNotePreviewer = false;
					scope.fullScreen = false;
					scope.$apply();
				});

				element.on('mousedown mousewheel DOMMouseScroll', function(e) {
					e.stopPropagation();
				});

				function preview(node, keyword, ifMax) {
					var icon = node.getRenderer('NoteIconRenderer').getRenderShape();
					var b = icon.getRenderBox('screen');
					var note = node.getData('note');

					$previewer[0].scrollTop = 0;

					var html = marked(note);
					if (keyword) {
						html = html.replace(new RegExp('(' + keyword + ')', 'ig'), '<span class="highlight">$1</span>');
					}
					scope.noteContent = $sce.trustAsHtml(html);
					scope.$apply(); // 让浏览器重新渲染以获取 previewer 提示框的尺寸

					var cw = $($container[0]).width();
					var ch = $($container[0]).height();
					var pw = $($previewer).outerWidth();
					var ph = $($previewer).outerHeight();

					var x = b.cx - pw / 2 - $container[0].offsetLeft;
					var y = b.bottom + 10 - $container[0].offsetTop;

					if (x < 0) x = 10;
					if (x + pw > cw) x = b.left - pw - 10 - $container[0].offsetLeft;
					if (y + ph > ch) y = b.top - ph - 10 - $container[0].offsetTop;


					scope.previewerStyle = {
						'left': Math.round(x) + 'px',
						'top': Math.round(y) + 'px'
					};
					scope.styleCopy = JSON.parse(JSON.stringify(scope.previewerStyle));

					scope.showNotePreviewer = true;

					var view = $previewer[0].querySelector('.highlight');
					if (view) {
						view.scrollIntoView();
					}
					previewLive = true;

					if(ifMax){
						scope.fullScreen = true;
						scope.previewerStyle = {
							'width': '90%',
							'height': '90%',
							'left': '5%',
							'top': '3%',
							'z-index': 2002,
							'max-width': '100%',
							'max-height': '100%'
						};
					}

					scope.$apply();
				}
			}
		}
}]);
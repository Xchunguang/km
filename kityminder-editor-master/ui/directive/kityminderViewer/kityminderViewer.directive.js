angular.module('kityminderEditor')
    .directive('kityminderViewer', ['config', 'minder.service', function(config, minderService) {
        return {
            restrict: 'EA',
            templateUrl: 'ui/directive/kityminderViewer/kityminderViewer.html',
            replace: true,
            scope: {
                onInit: '&'
            },
            link: function(scope, element, attributes) {

                var $minderEditor = element.children('.minder-viewer')[0];

                function onInit(editor, minder) {
                    scope.onInit({
                        editor: editor,
                        minder: minder
                    });

                    minderService.executeCallback();
                }

                if (window.kityminder && window.kityminder.Editor) {
                    var editor = new kityminder.Editor($minderEditor);

                    window.editor = scope.editor = editor;
                    window.minder = scope.minder = editor.minder;

                    onInit(editor, editor.minder);
                } else if(typeof(seajs) != 'undefined') {
                    seajs.config({
						base: './src'
					});

					define('demo', function(require) {
						var Editor = require('editor');

						var editor = window.editor = new Editor($minderEditor);
						window.minder = window.km = editor.minder;

						onInit(editor, minder);
					});

					seajs.use('demo');
                }

            }
        }
    }]);
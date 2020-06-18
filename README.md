# km客户端

## 安装依赖

        cd kityminder-editor-master
        npm run init

        cd kmclient
        npm install

## 启动

cd kmclient
npm run debug

## 调试

先启动kityminder-editor-master

        cd kityminder-editor-master
        grunt dev --force

再启动kmclient

        cd kmclient
        npm run debug

## 打包
先将kityminder-editor-master打包

        cd kityminder-editor-master
        grunt build --force
        //将kityminder-editor-master/dist下的文件整理复制到kmclient/km/dist

        cd kmclient
        npm run pack

## 打包成asar

        npm install asar -g
        cd /kmclient/build/km-win32-x64/resources/
        asar pack app app.asar
        //生成的app.asar即可替代app文件夹

## 打包成exe安装文件

        使用Inno Setup 6：
        软件下载：https://pc.qq.com/detail/13/detail_1313.html
        配置参考：package/inno_build.iss

## 使用npm run pack时可能存在的问题：
- 下载election zip包时由于路径错误(多一个v)，报404错误
解决方法：
    - npm config get prefix 查看npm安装路径
    - 打开electron-packager\node_modules\@electron\get\dist\cjs
    - 修改artifact-utils.js文件：主要修改正确获取path的语句
        
        function getArtifactRemoteURL(details) {
                const opts = details.mirrorOptions || {};
                let base = mirrorVar('mirror', opts, BASE_URL);
                if (details.version.includes('nightly')) {
                        base = mirrorVar('nightly_mirror', opts, NIGHTLY_BASE_URL);
                }
                const path = mirrorVar('customDir', opts, details.version).replace('{{ version }}', details.version.replace(/^v/, '')).replace(/^v/, '');
                const file = mirrorVar('customFilename', opts, getArtifactFileName(details));
                return `${base}${path}/${file}`;
        }

## 开发过程中可能需要对jQuery进行微调
在electron容器里包含CommonJS导致jQuery不会注册到window上报错，可以暂时修改jQuery最后几行：

        if ( !noGlobal ) {
                window.jQuery = window.$ = jQuery;
        }

修改为：

        window.jQuery = window.$ = jQuery;

注意在生产环境无需修改jQuery，只需要在kityminder-editor-master打包后，修改jQuery的引入方式：

        <script src="bower_components/jquery/dist/jquery.js"></script>

修改为：

        <script>
                window.jQuery = window.$ = require('../bower_components/jquery/dist/jquery.js');
        </script>


## 打包后的文件位置
链接：https://pan.baidu.com/s/1Gum5H3d2sdJuaihkI2DgLA 
提取码：yr3v
# km客户端

## 安装依赖

        cd kityminder-editor-master
        npm run init

        cd kmclient
        npm install

## 启动
npm run debug

## 调试
先启动kityminder-editor-master

        cd kityminder-editor-master
        grunt dev

再启动kmclient

        cd kmclient
        npm run debug

## 打包
先将kityminder-editor-master打包

        cd kityminder-editor-master
        grunt build --force

        cd kmclient
        npm install electron-packager -g
        npm run pack

使用npm run pack时可能存在的问题：
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
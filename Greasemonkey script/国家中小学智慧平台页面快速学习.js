// 拦截和修改XHR请求
(function(xhr) {
    var XHR = XMLHttpRequest.prototype;
    var open = XHR.open;
    var send = XHR.send;

    XHR.open = function(method, url) {
        this._url = url;
        return open.apply(this, arguments);
    };

    XHR.send = function() {
        this.addEventListener('load', function() {
            if (this._url.includes('progress') || this._url.includes('heartbeat')) {
                console.log('拦截:', this._url);
                var responseText = this.responseText;
                try {
                    var json = JSON.parse(responseText);
                    json.progress = 100;
                    json.completed = true;
                    Object.defineProperty(this, 'responseText', {get: function() {return JSON.stringify(json)}});
                } catch(e) {
                    console.error('修改响应失败:', e);
                }
            }
        });
        return send.apply(this, arguments);
    };
})(XMLHttpRequest);

// 模拟用户交互的函数
function simulateUserInteraction(video) {
    if (video) {
        video.dispatchEvent(new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true
        }));

        video.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }));
    }
}

// 更新存储的函数
function updateStorage() {
    const storageKeys = ['videoProgress', 'courseProgress', 'lessonComplete'];
    storageKeys.forEach(key => {
        try {
            localStorage.setItem(key, '100');
            sessionStorage.setItem(key, '100');
        } catch (e) {
            console.error('更新存储失败:', e);
        }
    });
}

// 跳过单个视频的函数
function skipVideo(video) {
    return new Promise((resolve) => {
        if (video) {
            video.currentTime = video.duration - 0.1;
            video.play().catch(e => console.error('播放视频错误:', e));
            
            video.dispatchEvent(new Event('ended'));
            video.dispatchEvent(new Event('complete'));

            simulateUserInteraction(video);
            updateStorage();

            if (typeof window.onVideoComplete === 'function') {
                window.onVideoComplete();
            }
            if (typeof window.finishLesson === 'function') {
                window.finishLesson();
            }

            // 等待一会儿以确保视频已处理
            setTimeout(resolve, 2000);
        } else {
            resolve();
        }
    });
}

// 展开所有折叠项的函数
async function expandAllCollapseItems() {
    const collapseHeaders = document.querySelectorAll('.fish-collapse-header[aria-expanded="false"]');
    for (const header of collapseHeaders) {
        header.click();
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}

// 查找所有资源项的函数
async function findAllResourceItems() {
    await expandAllCollapseItems();
    return document.querySelectorAll('.resource-item.resource-item-train');
}

// 处理所有视频的主函数
async function processAllVideos() {
    const resourceItems = await findAllResourceItems();
    console.log(`找到的资源项总数: ${resourceItems.length}`);

    for (let i = 0; i < resourceItems.length; i++) {
        const item = resourceItems[i];
        console.log(`正在处理第 ${i + 1} 项`);

        item.click();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待视频加载

        const video = document.querySelector('video');
        await skipVideo(video);

        console.log(`完成第 ${i + 1} 项`);
    }

    console.log("所有视频已处理完毕");
}

// 开始处理视频
processAllVideos().catch(error => {
    console.error("发生错误:", error);
});

// 提供手动控制函数
window.startProcessing = processAllVideos;
window.stopProcessing = () => {
    console.log('视频处理已停止。重新加载页面以重置。');
};


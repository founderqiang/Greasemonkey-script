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
                console.log('Intercepted:', this._url);
                // 修改响应以表示视频已完成
                var responseText = this.responseText;
                try {
                    var json = JSON.parse(responseText);
                    json.progress = 100;
                    json.completed = true;
                    Object.defineProperty(this, 'responseText', {get: function() {return JSON.stringify(json)}});
                } catch(e) {
                    console.error('Failed to modify response:', e);
                }
            }
        });
        return send.apply(this, arguments);
    };
})(XMLHttpRequest);

// 模拟用户交互
function simulateUserInteraction() {
    const video = document.querySelector('video');
    if (video) {
        // 模拟鼠标移动
        video.dispatchEvent(new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true
        }));

        // 模拟点击
        video.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }));
    }
}

// 修改localStorage和sessionStorage
function updateStorage() {
    const storageKeys = ['videoProgress', 'courseProgress', 'lessonComplete'];
    storageKeys.forEach(key => {
        try {
            localStorage.setItem(key, '100');
            sessionStorage.setItem(key, '100');
        } catch (e) {
            console.error('Failed to update storage:', e);
        }
    });
}

// 主要的跳过函数
function comprehensiveSkip() {
    const video = document.querySelector('video');
    if (video) {
        video.currentTime = video.duration - 0.1;
        video.play().catch(e => console.error('Error playing video:', e));
        
        // 触发视频结束事件
        video.dispatchEvent(new Event('ended'));
        video.dispatchEvent(new Event('complete'));
    }

    simulateUserInteraction();
    updateStorage();

    // 尝试调用可能存在的完成函数
    if (typeof window.onVideoComplete === 'function') {
        window.onVideoComplete();
    }
    if (typeof window.finishLesson === 'function') {
        window.finishLesson();
    }
}

// 定期尝试跳过
const skipInterval = setInterval(comprehensiveSkip, 5000);

// 提供一个停止函数
function stopSkipping() {
    clearInterval(skipInterval);
    console.log('Stopped skipping attempts');
}

// 提供一个手动触发的函数
window.manualSkip = comprehensiveSkip;
window.stopSkipping = stopSkipping;

console.log('Comprehensive video skip script loaded. Use manualSkip() to attempt skip, stopSkipping() to stop.');
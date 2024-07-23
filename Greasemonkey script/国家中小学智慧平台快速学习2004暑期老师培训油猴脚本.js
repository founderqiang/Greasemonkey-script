// ==UserScript==
// @name         国家中小学智慧平台快速学习2004暑假研修（快速学习）
// @namespace    http://tampermonkey.net/
// @version      3.2
// @author       桥风online（修改版）
// @description  需要进入具体的播放页面，加载油猴，可全部完成本页视频播放。有问题可以联系我 微信：founderqiang
// @match        https://basic.smartedu.cn/teacherTraining/courseDetail*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=qlteacher.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 拦截和修改XHR请求
    function interceptXHR() {
        const XHR = XMLHttpRequest.prototype;
        const open = XHR.open;
        const send = XHR.send;

        XHR.open = function(method, url) {
            this._url = url;
            return open.apply(this, arguments);
        };

        XHR.send = function() {
            this.addEventListener('load', function() {
                if (this._url.includes('progress') || this._url.includes('heartbeat')) {
                    console.log('拦截:', this._url);
                    try {
                        const json = JSON.parse(this.responseText);
                        json.progress = 100;
                        json.completed = true;
                        Object.defineProperty(this, 'responseText', { 
                            get: function() { return JSON.stringify(json); }
                        });
                    } catch (e) {
                        console.error('修改响应失败:', e);
                    }
                }
            });
            return send.apply(this, arguments);
        };
    }

    // 模拟用户交互
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

    // 更新存储
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

    // 跳过单个视频
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

                setTimeout(resolve, 2000);
            } else {
                resolve();
            }
        });
    }

    // 展开所有折叠项并点击所有资源项
    async function expandAndClickAll() {
        // 点击顶层折叠项
        const topLevelHeaders = document.querySelectorAll('.fish-collapse-item > .fish-collapse-header');
        for (const header of topLevelHeaders) {
            if (header.getAttribute('aria-expanded') === 'false') {
                header.click();
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // 点击二级折叠项
        const secondLevelHeaders = document.querySelectorAll('.fish-collapse-content .fish-collapse-header');
        for (const header of secondLevelHeaders) {
            if (header.getAttribute('aria-expanded') === 'false') {
                header.click();
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

    }

    // 查找所有资源项
    async function findAllResourceItems() {
        await expandAndClickAll();
        return document.querySelectorAll('.resource-item.resource-item-train');
    }

    // 处理所有视频
    async function processAllVideos() {
        const resourceItems = await findAllResourceItems();
        console.log(`找到的资源项总数: ${resourceItems.length}`);

        for (let i = 0; i < resourceItems.length; i++) {
            const item = resourceItems[i];
            console.log(`正在处理第 ${i + 1} 项`);

            item.click();
            await new Promise(resolve => setTimeout(resolve, 1000));

            const video = document.querySelector('video');
            await skipVideo(video);

            console.log(`完成第 ${i + 1} 项`);
        }

        console.log("所有视频已处理完毕");
    }

    // 主函数
    function main() {
        interceptXHR();
        
        // 添加控制按钮
        const controlButton = document.createElement('button');
        controlButton.textContent = '开始处理视频';
        controlButton.style.position = 'fixed';
        controlButton.style.top = '10px';
        controlButton.style.right = '10px';
        controlButton.style.zIndex = '9999';
        
        controlButton.addEventListener('click', () => {
            if (controlButton.textContent === '开始处理视频') {
                processAllVideos().catch(error => {
                    console.error("发生错误:", error);
                });
                controlButton.textContent = '停止处理';
            } else {
                window.location.reload();
            }
        });
        
        document.body.appendChild(controlButton);
    }

    // 当页面加载完成时运行主函数
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();
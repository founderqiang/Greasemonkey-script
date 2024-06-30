function findButtonByPartialText(text) {
    return Array.from(document.querySelectorAll('button')).find(button => 
      button.textContent.trim().includes("开始学习")
    );
  }
  
  function clickButton(text) {
    const maxAttempts = 2;
    let attempts = 0;
  
    function attemptClick() {
      const button = findButtonByPartialText(text);
      if (button) {
        button.click();
        console.log(`已点击包含 '${text}' 的按钮`);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(attemptClick, 500);  // 每500毫秒尝试一次
      } else {
        console.log(`未找到包含 '${text}' 的按钮`);
      }
    }
  
    attemptClick();
  }
  
  // 立即开始尝试点击按钮
  clickButton('开始学习');
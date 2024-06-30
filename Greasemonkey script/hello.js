var buttons = document.getElementsByTagName("button");
for(var i=0; i<buttons.length; i++){
    var spans = buttons[i].getElementsByTagName("span");
    for(var j=0; j<spans.length; j++){
        if(spans[j].innerText){
            if(spans[j].innerText.includes("继续学习")){
                buttons[i].click();
            }
            if(spans[j].innerText.includes("开始学习")){
                buttons[i].click();
            }
            if(spans[j].innerText.includes("已完成学习")){
                window.close();
            }
        }
    }
}

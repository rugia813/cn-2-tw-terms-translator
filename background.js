function tranword() {
    chrome.tabs.query({ active: true,currentWindow:true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { "message": "TransWord" }, function (response) {
            return true;
        });  
    });
}

function findAndShowError() {

}

function createMenus() {
    var main = chrome.contextMenus.create({
        "title": "翻譯中國用語",
        "contexts": ['all'],
        "onclick": tranword,
    });


    // 使用chrome.contextMenus.create的方法回傳值是項目的id
    console.log(main);
    
}

createMenus();
const nodeList = []
const myWorker = new Worker(chrome.runtime.getURL('worker.js'));
let timeoutIdMain, timeoutIdGoogle

myWorker.onmessage = function(e) {
    // console.log('Message received from worker', e.data);
    const [text, idx] = e.data
    nodeList[idx].innerText = text
    nodeList[idx] = null
};

function tellWorkerToTranslate(node) {
    nodeList.push(node)
    const idx = nodeList.length - 1
    myWorker.postMessage([node.innerText, idx]);
}

/**
 * 翻譯，會先爬到最底層的DOM，再翻譯該DOM的文字
 * @param  {HTMLElement} node 
 * @return {void}
 */
function translate(node) {
    if (node.children.length) {
        forEach(node.children, node => translate(node))
    } else if (node.root) {
        forEach(node.root.children, node => translate(node))
    } else {
        tellWorkerToTranslate(node)
    }
}

function forEach(collection, cb) {
    for (const i in collection) {
        if (collection.hasOwnProperty(i)) {
            const element = collection[i];
            cb(element, i)
        }
    }
}

function callTranslate() {
    // translated.clear()
    // const st = performance.now()
    clearTimeout(timeoutIdMain)
    timeoutIdMain = setTimeout(() => {
        console.log('start translating');
        translate(document.body)
    }, 1000);
    // const dur = performance.now() - st
    // console.log('translate done in ' + (dur / 1000).toFixed(4) + 's')
    // console.log(Array.from(translated.values()).join(','));
}

// 從contextMenu點擊翻譯
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message == 'translate') {
        callTranslate()
    }
    return true;
});

const url = window.location.host
chrome.storage.sync.set({[url]: true}, function() {
    console.log('Value is set to ' + 'value');
});

chrome.storage.sync.get(url, function(result) {
    console.log('Value currently is ',  result);
});

document.body.onload = function() {
    chrome.storage.sync.get(url, function(result) {
        if (result[url]) {
            callTranslate()
        }
    });
}

// google翻譯時
document.addEventListener('DOMSubtreeModified', function (e) {
    if (e.target.tagName === 'HTML') {
        if (e.target.className.match('translated-ltr')) {
            // page has been translated
            // console.log('google translated');
            setTimeout(callTranslate, 1000);
        } else {
            // page has been translated and translation was canceled
            // console.log('google translate cancelled');
            // setTimeout(callTranslate, 1000);
        }
   }
   if (e.target.tagName === 'BODY') {
       clearTimeout(timeoutIdGoogle)
       timeoutIdGoogle = setTimeout(() => {
        callTranslate()
        // console.log('body modified');
       }, 2000);
   }
}, true);
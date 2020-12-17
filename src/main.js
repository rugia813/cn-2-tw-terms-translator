const nodeList = []
const myWorker = new Worker(chrome.runtime.getURL('worker.js'));
let timeoutIdMain, timeoutIdGoogle

myWorker.onmessage = function(e) {
    // console.log('Message received from worker', e.data);
    const [text, idx] = e.data
    if (nodeList[idx].innerText) nodeList[idx].innerText = text
    else if (nodeList[idx].nodeValue ) nodeList[idx].data = text // text node
    nodeList[idx] = null
};

function tellWorkerToTranslate(node) {
    nodeList.push(node)
    const idx = nodeList.length - 1
    myWorker.postMessage([node.innerText || node.nodeValue , idx]);
}

/**
 * 翻譯，會先爬到最底層的DOM，再翻譯該DOM的文字
 * @param  {HTMLElement} node
 * @return {void}
 */
function translate(node) {
    if (node.childNodes.length) {
        forEach(node.childNodes, node => translate(node))
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

async function callTranslate() {
    const hostname = window.location.hostname
    const activated = await getSiteStatus(hostname)
    if (!activated) return

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

function setSiteStatus(host, bool) {
    chrome.storage.sync.set({ [host]: bool }, function () {
        console.log(host, 'is set to ' + bool);
    });
}

function getSiteStatus(host) {
    return new Promise((res, rej) => chrome.storage.sync.get(host, function (result) {
        console.log(host, 'currently is ', result[host]);
        res(result[host])
    }));
}
function toggleIcon(bool) {
    chrome.runtime.sendMessage(null, {
        type: 'icon',
        value: bool
    })
}

// 從contextMenu點擊翻譯
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message == 'translate') {
        callTranslate()
    }
    return true;
});

document.body.onload = async function () {
    const hostname = window.location.hostname
    const activated = await getSiteStatus(hostname)
    toggleIcon(activated)
    activated && callTranslate()
}

// google翻譯時
const callback = function (mutationsList, observer) {
    for (const e of mutationsList) {
        if (e.target.tagName === 'HTML') {
            if (e.target.className.match('translated-ltr')) {
                // page has been translated
                // console.log('google translated');
                setTimeout(callTranslate, 1000);
            }
        }
        if (e.target.tagName === 'BODY') {
            clearTimeout(timeoutIdGoogle)
            timeoutIdGoogle = setTimeout(() => {
                callTranslate()
                // console.log('body modified');
            }, 2000);
        }
    }
};
const observer = new MutationObserver(callback);
observer.observe(document, { attributes: true, childList: true, subtree: true });
import {loadConfig} from "../src/config";

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason.search(/install/g) === -1) {
        return;
    }
    chrome.tabs.create({
        url: chrome.runtime.getURL("welcome.html"),
        active: true,
    });

    // Create context menu item
    chrome.contextMenus.create({
        id: "freeScribeCopilot",
        title: "Start FreeScribe Copilot",
        contexts: ["page", "selection"],
    });
});

// Handle context menu item click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "freeScribeCopilot") {
        loadExtension(tab.id);
    }
});

chrome.commands.onCommand.addListener((command) => {
    switch (command) {
        case "configure":
            chrome.runtime.openOptionsPage?.() ||
            window.open(chrome.runtime.getURL("options.html"));
            break;
        default:
            chrome.runtime.sendMessage({action: command});
            break;
    }
});

async function loadExtension(tabId) {
    const existingContexts = await chrome.runtime.getContexts({});

    const offscreenDocument = existingContexts.find((c) => c.contextType === 'OFFSCREEN_DOCUMENT');

    // If an offscreen document is not already open, create one.
    if (offscreenDocument) {
       await chrome.offscreen.closeDocument();
    }

    // Create an offscreen document.
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA', 'WORKERS'],
        justification: 'Recording from chrome.tabCapture API'
    });

    // Inject the content script into the current tab
    await chrome.scripting.insertCSS({
        target: {tabId: tabId, allFrames: true}, files: ['main.css']
    });

    // Inject the content script into the current tab
    await chrome.scripting.executeScript({
        target: {tabId: tabId, allFrames: true}, files: ['content.js'],
    });
}

chrome.action.onClicked.addListener(async (tab) => {
    // Inject the content script into the current tab
    await loadExtension(tab.id);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target === "background") {
        if (message.type === "capture-tab-audio") {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                const tab = tabs[0];
                const tabId = tab.id;

                chrome.tabCapture.getMediaStreamId({
                    targetTabId: tabId
                }, (streamId) => {
                    sendResponse({success: true, streamId: streamId});
                });
            });
            return true;
        } else if (message.type === "load-config") {
            loadConfig().then((config) => {
                sendResponse({success: true, config: config});
            });
            return true;
        } else if(message.type === "show-history") {
            chrome.tabs.create({
                url: chrome.runtime.getURL("history.html"),
                active: true,
            });
        }
    } else if (message.target === "content") {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, message);
            }
        });
    }
});

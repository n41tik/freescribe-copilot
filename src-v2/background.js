import {loadConfig} from "../src/config";

// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
    // Check if the reason is an install
    if (details.reason.search(/install/g) === -1) {
        return;
    }
    // Open the welcome page in a new tab
    chrome.tabs.create({
        url: chrome.runtime.getURL("welcome.html"),
        active: true,
    });

    // Create a context menu item
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

// Listener for keyboard commands
chrome.commands.onCommand.addListener((command) => {
    switch (command) {
        case "configure":
            // Open the options page
            chrome.runtime.openOptionsPage?.() ||
            window.open(chrome.runtime.getURL("options.html"));
            break;
        default:
            // Send the command to the content script
            chrome.runtime.sendMessage({action: command});
            break;
    }
});

let tabsActive = [];

function getHostFromURL(url) {
    try {
        const parsedURL = new URL(url);
        return parsedURL.host; // Includes hostname and port, if any
    } catch (e) {
        console.error('Invalid URL:', e.message);
        return null;
    }
}

// Function to load the extension
async function loadExtension(tabId, host) {
    const existingContexts = await chrome.runtime.getContexts({});

    const offscreenDocument = existingContexts.find((c) => c.contextType === 'OFFSCREEN_DOCUMENT');

    // If an offscreen document is already open, close it
    if (offscreenDocument) {
        await chrome.offscreen.closeDocument();
    }

    // Create a new offscreen document
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA', 'WORKERS'],
        justification: 'Recording from chrome.tabCapture API'
    });

    // Inject the CSS into the current tab
    await chrome.scripting.insertCSS({
        target: {tabId: tabId, allFrames: true}, files: ['content.css']
    });

    // Inject the content script into the current tab
    await chrome.scripting.executeScript({
        target: {tabId: tabId, allFrames: true}, files: ['content.js'],
    });

    if (!host) {
        return;
    }

    // Add the tab to the list of active tabs
    tabsActive.push(host);
}

async function unloadExtension(tabId, host) {
    // Remove the tab from the list of active tabs
    tabsActive = tabsActive.filter((h) => h !== host);

    chrome.tabs.query({}, (tabs) => {
        // send message to all the tabs that has the content script injected
        for (let tab of tabs) {
            let tabHost = getHostFromURL(tab.url);
            if (host === tabHost) {
                chrome.tabs.sendMessage(tab.id, {
                    target: 'content', type: 'close-extension',
                });
            }
        }
    });
}

// Listener for the extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    // Get the host from the URL
    const host = getHostFromURL(tab.url);

    if (tabsActive.includes(host)) {
        await unloadExtension(tab.id, host);
    } else {
        await loadExtension(tab.id, host);
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        let host = getHostFromURL(tab.url);

        if (host && tabsActive.includes(host)) {
            loadExtension(tabId);
        }
    }
});


// Listener for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target === "background") {
        if (message.type === "load-config") {
            // Load the configuration
            loadConfig().then((config) => {
                sendResponse({success: true, config: config});
            });
            return true;
        } else if (message.type === "show-page") {
            // Open the history page in a new tab
            chrome.tabs.create({
                url: chrome.runtime.getURL(message.page),
                active: true,
            });
        }
    } else if (message.target === "content") {
        // Forward the message to the content script
        chrome.tabs.query({}, (tabs) => {
            // send message to all the tabs that has the content script injected
            for (let tab of tabs) {
                let host = getHostFromURL(tab.url);
                if (tabsActive.includes(host)) {
                    chrome.tabs.sendMessage(tab.id, message);
                }
            }
        });
    }
});

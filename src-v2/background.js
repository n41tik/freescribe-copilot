import {loadConfig} from "../src/config";

// Listener for when the extension is installed or updated and if installed,
// open the welcome page in a new tab to show the user the new features and ask user permission to the microphone
// Also, create a context menu item to start the extension
chrome.runtime.onInstalled.addListener((details) => {
    // Check if the reason is an installation
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

// Handle the context menu item click event and load the extension on the current tab
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "freeScribeCopilot") {
        loadExtension();
    }
});

// Listener for keyboard commands and pass the command to the content script or open the options page
chrome.commands.onCommand.addListener((command, tab) => {
    switch (command) {
        case "configure":
            // Open the options page
            chrome.runtime.openOptionsPage?.() ||
            window.open(chrome.runtime.getURL("options.html"));
            break;
        default:
            // Send the command to the content script
            chrome.tabs.sendMessage(tab.id, {command: command});
            break;
    }
});

// Function: getOffscreenDocument - Find offscreen document of the extension and return if exists
async function getOffscreenDocument() {
    // get existing contexts of the extension
    const existingContexts = await chrome.runtime.getContexts({});

    // Check if an offscreen document already exists
    return existingContexts.find((c) => c.contextType === 'OFFSCREEN_DOCUMENT');
}

// Function: loadExtension - Load the extension on the current tab.
// Check if an offscreen document already exists and create a new one if it doesn't.
// Inject the CSS and content script into the current tab.
// Add the tab to the list of active tabs.
async function loadExtension() {
    // Get Offscreen document if present in the extension context
    const offscreenDocument = await getOffscreenDocument();

    // Only create a new offscreen document if one doesn't already exist
    if (!offscreenDocument) {
        // Create a new offscreen document
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['USER_MEDIA', 'WORKERS'],
            justification: 'Recording from chrome.tabCapture API'
        });
    }
}

// Function: closeExtension - Close all the instance of extension on all the tabs including the offscreen page
// Get the offscreen document and if present close the document
// Get list of all the tabs and send message to close the extension on all the active domain
// clear the list of active tabs
async function closeExtension() {
    // Get Offscreen document if present in the extension context
    const offscreenDocument = getOffscreenDocument();

    // if offscreen document is open close the doucment
    if (offscreenDocument) {
        await chrome.offscreen.closeDocument();
    }
}

// Listener for the extension icon click
// If the extension is already loaded for the host, unload it. Otherwise, load it.
chrome.action.onClicked.addListener(async (tab) => {
    await loadExtension();
    chrome.action.setPopup({popup: 'popup.html'});
    chrome.action.openPopup();
});


// Listener for messages from other parts of the extension
// Load the configuration and send it back to the sender
// Open pages in a new tab
// Forward messages to the offscreen document or content script based on the target
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target === "background") {
        if (message.type === "load-config") {
            // Load the configuration
            loadConfig().then((config) => {
                sendResponse({success: true, config: config});
            });
            return true;
        } else if (message.type === "reload-extension") {
            closeExtension();
        }
    }
});

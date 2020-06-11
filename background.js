function isSupported() {
	try {
		return isJiraTab() || isZendeskTab() || isDeviceFarmTab() || isTrelloTab();
	} catch (error) {
		console.error("Error during tab detection:");
		console.error(error);
		return false;
	}
}

function loadExtension() {
	if ((document.readyState === "interactive" || document.readyState === "complete")) {
		if (isSupported()) {
			// Poll DOM tree to decide necessary action to take
			addTimer();

			// Listen messages from other windows (i.e TestFairy iframes to get notified about content dimensions)
			window.addEventListener("message", receiveMessage, false);
		}
	}
}

function receiveMessage(event) {
	var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
	if (event.data.height && document.getElementById(getTestFairyCommonIFrameId())) {
		// TODO : Do this for all kinds of TestFairy iframes when it becomes necessary
		document.getElementById(getTestFairyCommonIFrameId()).height = (event.data.height) + "px";
	}
}

function addTimer() {
	if (isSupported()) {
		// Try again to see if tab content changed in a way that we can support
		// i.e Angular loaded, React changed DOM tree, HTLM5 history API changed url without leaving the page etc
		setTimeout(addTimer, 2000);
	}

	var testFairyFrame = document.querySelector(getTestFairyCommonIFrameSelector());
	if ((isJiraTab() || isZendeskTab() || isTrelloTab()) && testFairyFrame) {
		// No need to load extension twice for Jira, Zendesk and Trello if iframe already exists
		// Device farm uses multiple iframes without any specific id, thus must be processed always
		return;
	}

	if (isJiraTab()) {
		addTestFairyJiraIFrame();
	}

	if (isZendeskTab()) {
		addTestFairyZendeskIFrame();
	}

	if (isDeviceFarmTab()) {
		addTestFairyDeviceFarmIFrame();
	}

	if (isTrelloTab()) {
		addTestFairyTrelloIFrame();
	}
}

////////////////////////////////// Startup

if (chrome && chrome.extension && chrome.extension.sendMessage) {
	chrome.extension.sendMessage({}, loadExtension); // Chrome
} else if (browser && browser.runtime && browser.runtime.sendMessage) {
	browser.runtime.sendMessage({}).then(loadExtension).catch(loadExtension); // Firefox (WebExtensions)
} else {
	throw new Error('TestFairy extension does not support this browser!');
}

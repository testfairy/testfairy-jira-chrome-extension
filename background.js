function isSupported() {
	try {
		return isJiraTab() || isZendeskTab() || isDeviceFarmTab() || isTrelloTab() || isIntercomTab() || isSauceLabsTab() || isPerfectoTab();
	} catch (error) {
		console.error("Error during tab detection:");
		console.error(error);
		return false;
	}
}

function loadExtension() {
	if ((document.readyState === "interactive" || document.readyState === "complete")) {
		addTimer();

		// Listen messages from other windows (i.e TestFairy iframes to get notified about content dimensions)
		window.addEventListener("message", receiveMessage, false);
	}
}

function receiveMessage(event) {
	var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
	if (event.data.height) {
		var height = (event.data.height) + "px";
		var elementById = document.getElementById(getTestFairyCommonIFrameId());
		if (elementById) {
			elementById.height = height;
		}

		var elementByClass = document.querySelectorAll("." + getTestFairyCommonIFrameId());
		if (elementByClass.length > 0) {
			elementByClass.forEach(element => {
				element.height = height;
			});
		}
	}
}

var remainingAttempts = 64;
function addTimer() {
	// SPA friendly reattempts
	if (remainingAttempts > 0) {
		setTimeout(addTimer, 2000);
	}

	// Try again
	if (!isSupported()) {
		remainingAttempts--;
		return;
	}

	// If very last attempt was lucky, reenable timer
	if (remainingAttempts == 0) {
		setTimeout(addTimer, 2000);
	}

	// Reset remainingAttempts on successful attempt
	remainingAttempts = 64;

	var testFairyFrame = document.querySelector(getTestFairyCommonIFrameSelector());
	if ((isJiraTab() || isZendeskTab() || isTrelloTab() || isSauceLabsTab() || isPerfectoTab()) && testFairyFrame) {
		// No need to load extension twice for Jira, Zendesk, Trello and Sauce Labs if iframe already exists
		// Device farm uses multiple iframes without any specific ids, thus must be processed always
		cleanPerfectoIfNecessary();

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

	if (isIntercomTab()) {
		addIntercomIFrame();
	}

	if (isSauceLabsTab()) {
		addSauceLabsIFrame();
		proceedToDeviceSelection();
	}

	if (isPerfectoTab()) {
		addPerfectoIFrame();
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

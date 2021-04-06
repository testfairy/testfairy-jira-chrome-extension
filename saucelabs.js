// atomic counter for pending ajax calls, used to block periodic timer for extension racing with existing uncomplete processing
var sauceLabsBusy = 0;
var appToProceed = null;

function getCommandsTabSelector() {
	return "#test-details-appium-nav-tab-commands";
}

function getViewLogsTabSelector() {
	return "#test-details-appium-nav-tab-logs";
}

function getLogsDropDownSelector() {
	return "#test-details-appium-nav-pane-logs > div > div > div:nth-child(1) > div > div > span";
}

function getLogsDropDownAppiumSelector() {
	return "#test-details-appium-nav-pane-logs > div > div > div:nth-child(1) > div > div > ul > li:nth-child(4) > a";
}

function getLogsContainerSelector() {
	return "#test-details-appium-nav-pane-logs > div > div > div > pre";
}

function getSauceLabsTestId() {
	return window.location.pathname.replace('/tests/', '') || '';
}

function getSauceLabsRegion() {
	return window.location.host.replace('.saucelabs.com', '').split('.').reverse()[0];
}

function getSauceLabsDeviceLogsUrl() {
	return "https://api." + getSauceLabsRegion() + ".saucelabs.com/v1/rdc/jobs/" + getSauceLabsTestId() + "/deviceLogs";
}

function isSauceLabsTab() {
	var linkTags = document.getElementsByTagName("link");

	// <link rel="icon" href="https://cdn1.saucelabs.com/web-ui/images/favicons-9f5b30f71bc06066553366725ec54c3e312e2b388e126d3af19999920cc822e6/favicon.svg">
	var saucelabsCdnFound = false;

	for (var i = 0; i < linkTags.length; i++) {
		if (
			linkTags[i].getAttribute('rel') === 'icon' &&
			linkTags[i].getAttribute('href').indexOf('.saucelabs.com') !== -1
		) {
			saucelabsCdnFound = true;
			break;
		}
	}

	var testPageFound = isHex(getSauceLabsTestId());
	var livePageFound = window.location.pathname === '/live/app-testing';

	const params = new URLSearchParams(window. location. search);
	if (params.has('tfApp')) {
		appToProceed = params.get('tfApp');
	}

	return saucelabsCdnFound && (testPageFound || livePageFound);
}

function addSauceLabsIFrame() {
	var testPageFound = isHex(getSauceLabsTestId());
	if (!testPageFound) {
		return;
	}

	if (sauceLabsBusy === 0) {
		if (!document.querySelector(getViewLogsTabSelector())) {
			return;
		}

		sauceLabsBusy += 1;

		document.querySelector(getViewLogsTabSelector()).click();

		if (!document.querySelector(getLogsDropDownSelector())) {
			sauceLabsBusy = 0;
			return;
		}
		document.querySelector(getLogsDropDownSelector()).click();

		if (!document.querySelector(getLogsDropDownAppiumSelector())) {
			sauceLabsBusy = 0;
			return;
		}
		document.querySelector(getLogsDropDownAppiumSelector()).click();

		var logs = document.querySelector(getLogsContainerSelector()).innerText.split('\n');

		document.querySelector(getCommandsTabSelector()).click();

		var sessionResponse = null;
		for (var i = 0; i < logs.length; i++) {
			var logLine = logs[i];
			var testFairySessionReponseIndex = logLine.search("TESTFAIRYSDK : Received: ");

			if (testFairySessionReponseIndex !== -1) {
				try {
					sessionResponse = JSON.parse(logLine.slice(testFairySessionReponseIndex + 24));
					break;
				} catch(_) {}
			}
		}

		if (sessionResponse) {
			var sessionUrl = sessionResponse.sessionUrl;
			if (sessionUrl) {
				sessionUrl = convertSessionUrlToIFrameUrl(sessionUrl, 'source=saucelabs');

				var iFrame = createIFrame(sessionUrl, getTestFairyCommonIFrameId());
				var testFairyContainer = createDiv('card', [
					createDiv('', [
						createSpan('', ''),
						createH3('', 'TestFairy')
					]),
					iFrame
				]);

				var videoCardContainer = document.querySelector('.video-wrapper').parentNode.parentNode.parentNode;
				var videoHeight = videoCardContainer.offsetHeight;
				var rightSectionHeight = videoCardContainer.parentNode.parentNode.parentNode.offsetHeight;

				insertAfter(testFairyContainer, videoCardContainer);

				// Fix video height
				videoCardContainer.style.height = videoHeight + "px";

				setTimeout(function() {
					// Fix surrounding panels
					videoCardContainer.parentNode.parentNode.parentNode.parentNode.style.height = (rightSectionHeight + iFrame.offsetHeight + 50) + "px";
					videoCardContainer.parentNode.parentNode.parentNode.style.height = (rightSectionHeight + iFrame.offsetHeight) + "px";
					videoCardContainer.parentNode.parentNode.style.height = (rightSectionHeight + iFrame.offsetHeight) + "px";
					videoCardContainer.parentNode.style.height = (rightSectionHeight + iFrame.offsetHeight) + "px";

					sauceLabsBusy = 0;
				}, 5000); // Fix layout after a safe enough delay
			}
		}
	}
}

function proceedToDeviceSelection() {
	var livePageFound = window.location.pathname === '/live/app-testing';

	if (appToProceed || livePageFound) {
		sauceLabsBusy++;

		const appGroupIdElement = [...document.querySelectorAll('span')].filter(div => div.innerHTML === appToProceed)[0];
		if (appGroupIdElement) {
			const rowParent = appGroupIdElement.parentNode.parentNode.parentNode.parentNode;
			[...rowParent.querySelectorAll('span')].filter(div => div.innerHTML === 'Choose device')[0].click()
		}

		setTimeout(function() {
			sauceLabsBusy = 0;
		}, 1000);
	}
}

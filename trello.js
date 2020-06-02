function getTrelloCardDescriptionLinksSelector() {
	return ".js-fill-card-detail-desc > div > .window-module > .u-gutter > .editable > .description-content > .current > p > a";
}

function isTrelloTab() {
	var metaTags = document.getElementsByTagName("meta");

	// <meta name="apple-itunes-app" content="app-id=461504587, app-argument=https://trello.com/">
	var iTunesAppFound = false;

	for (var i = 0; i < metaTags.length; i++) {
		if (
			metaTags[i].getAttribute('name') === 'apple-itunes-app' &&
			metaTags[i].getAttribute('content').indexOf('app-id=461504587') !== -1
		) {
			iTunesAppFound = true;
		}
	}

	var trelloRootFound = !!document.querySelector('#trello-root');

	return iTunesAppFound && trelloRootFound;
}

function addTestFairyTrelloIFrame() {
	// Get links in description box
	var links = document.querySelectorAll(getTrelloCardDescriptionLinksSelector());

	// Search for a session url
	var sessionUrl = null;
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		if (link.href && link.href.search(getSessionUrlRegex()) !== -1) {
			sessionUrl = convertSessionUrlToIFrameUrl(link.href);
			break;
		}
	}

	// Inject iframe if session url is found
	if (sessionUrl) {
		// Inject iframe in a Trello friendly container (dressed with css from Trello)
		var testFairyContainer = createDiv('window-module', [
			createDiv('window-module-title window-module-title-no-divider card-detail-activity', [
				createSpan('window-module-title-icon icon-lg icon-activity', ''),
				createH3('', 'TestFairy')
			]),
			createIFrame(sessionUrl, getTestFairyCommonIFrameId())
		]);

		var descriptionSection = document.querySelector('.js-fill-card-detail-desc');
		insertAfter(testFairyContainer, descriptionSection);

		// Fix card dimensions to fit iframe
		var card = document.querySelector('#chrome-container > div.window-overlay > div.window');
		card.setAttribute('style', 'width: 800px;' + card.getAttribute('style'));

		// Fix card content dimensions to fit iframe
		var cardContent = document.querySelector('#chrome-container > div.window-overlay > div > div > div > div.window-main-col');
		var cardContentStyle = cardContent.getAttribute('style');
		cardContent.setAttribute('style', 'width: 562px;' + (cardContentStyle ? cardContentStyle : ''));

		console.error(testFairyContainer);
	}
}

function isIntercomTab() {
	var title = document.querySelector("title");
	return title.innerText.toLowerCase().indexOf("intercom") > -1;
}

function hasTestFairyFrame(element) {
	if (element == null) {
		return false;
	}

	for (var i = 0; i < element.childNodes.length; i++) {
		if (element.childNodes[i].className.indexOf("window-module") > -1) {
		  return true;
		}
	}

	return false;
}

function addIntercomIFrame() {
	var links = document.querySelectorAll(".intercom-interblocks a");
	var sessionUrl = null;
	var element = null;
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		if (link.href && link.href.search(getSessionUrlRegex()) !== -1) {
			var parent = link.closest(".intercom-interblocks");
			if (hasTestFairyFrame(parent)) {
				continue;
			}

			sessionUrl = convertSessionUrlToIFrameUrl(link.href, 'source=intercom');
			element = link;
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
			createIFrame(sessionUrl, null, null, null, null, null, getTestFairyCommonIFrameId())
		]);

		var descriptionSection = link.closest(".intercom-interblocks-paragraph");
		insertAfter(testFairyContainer, descriptionSection);

		// // Fix card dimensions to fit iframe
		// var card = document.querySelector('#chrome-container > div.window-overlay > div.window');
		// card.setAttribute('style', 'width: 800px;' + card.getAttribute('style'));

		// // Fix card content dimensions to fit iframe
		// var cardContent = document.querySelector('#chrome-container > div.window-overlay > div > div > div > div.window-main-col');
		// var cardContentStyle = cardContent.getAttribute('style');
		// cardContent.setAttribute('style', 'width: 562px;' + (cardContentStyle ? cardContentStyle : ''));

		// console.error(testFairyContainer);
	}
}

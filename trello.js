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

	return iTunesAppFound;
}

function addTestFairyTrelloIFrame() {
	var cardDescriptionLinksSelector =
		".js-fill-card-detail-desc > div > .window-module > .u-gutter > .editable > .description-content > .current > p > a";
	var links = document.querySelectorAll(cardDescriptionLinksSelector);

	var sessionUrl = null;
	for (var i = 0; i < links.length; i++) {
		var link = links[i]
		if (link.href && link.href.search(getSessionUrlRegex()) !== -1) {
			sessionUrl = link.href;
			break;
		}
	}

	console.error(sessionUrl);
}

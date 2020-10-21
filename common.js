function getTestFairyCommonIFrameId() {
	return 'testfairy-iframe';
}

function getTestFairyCommonIFrameSelector() {
	return '#' + getTestFairyCommonIFrameId();
}

function getSessionUrlRegex() {
	return /^https:\/\/[\w\._-]+\/projects\/(\d+)(-[\w-\._]+)?\/builds\/(\d+)\/sessions\/(\d+).*$/;
}

function convertSessionUrlToIFrameUrl(sessionUrl, injectedQueryParams) {
	if (!sessionUrl.includes("projects") || !sessionUrl.includes("builds") || !sessionUrl.includes("sessions")) {
		return false;
	}

	if (sessionUrl.includes('?iframe')) {
		return sessionUrl;
	}

	var hash = "";
	var base = sessionUrl;
	if (sessionUrl.includes('#')) {
		hash = sessionUrl.substring(sessionUrl.indexOf('#'));
		base = sessionUrl.substring(0, sessionUrl.indexOf('#'));
	}

	if (injectedQueryParams) {
		return base + "?iframe=1&" + injectedQueryParams + hash;
	} else {
		return base + "?iframe" + hash;
	}
}

function createIFrame(url, id, headingTitle, width, height, overflow, className) {
	var h2 = document.createElement('h2');
	h2.setAttribute("class", "toggle-title");
	h2.textContent = headingTitle ? headingTitle : '';

	var heading = document.createElement('div');
	heading.setAttribute("class", "mod-header");
	heading.appendChild(h2);

	var iframe = document.createElement('iframe');
	if (id) {
		iframe.setAttribute('id', id);
	}
	if (className) {
		iframe.classList.add(className);
	}

	iframe.setAttribute('frameborder', '0');
	iframe.setAttribute('width', width ? width : '100%');
	iframe.setAttribute('height', height ? height : 'auto');
	iframe.setAttribute('src', url);

	if (overflow) {
		iframe.setAttribute('style', 'overflow: ' + overflow);
	}

	var content = document.createElement('div');
	content.setAttribute("class", "mod-content");
	content.appendChild(iframe);

	var parent = document.createElement('div');
	parent.setAttribute("class", "module toggle-wrap");

	if (headingTitle) {
		parent.appendChild(heading);
	}

	parent.appendChild(content);

	return parent;
}

function createA(text, url) {
	var a = document.createElement('a');
	a.href = url;
	a.innerText = text;
	a.setAttribute('target', '_blank');

	return a;
}

function createLi(child) {
	var li = document.createElement('li');
	li.appendChild(child);

	return li;
}

function createLiWithText(text) {
	var li = document.createElement('li');
	li.innerText = text;

	return li;
}

function createDiv(cssClass, children) {
	var div = document.createElement('div');
	div.setAttribute('class', cssClass);

	if (children && children.forEach) {
		children.forEach(function (child) {
			div.appendChild(child);
		});
	}

	return div;
}

function createSpan(cssClass, text) {
	var span = document.createElement('span');
	span.setAttribute('class', cssClass);
	span.innerText = text;

	return span;
}

function createH3(cssClass, text) {
	var h3 = document.createElement('h3');
	h3.setAttribute('class', cssClass);
	h3.innerText = text;

	return h3;
}

function injectModal() { // Assumes Twitter Bootstrap exists
	function show() {
		document.querySelector('#testfairy-modal').style.display = "block";
	}

	function hide() {
		document.querySelector('#testfairy-modal').style.display = "none";
	}

	function clear() {
		document.querySelector('#testfairy-modal .row .column').innerText = '';
	}

	function addContent(content) {
		document.querySelector('#testfairy-modal .row .column').appendChild(content);
	}

	var modal = document.querySelector('#testfairy-modal')
	if (modal) {
		return {element: modal, show: show, hide: hide, clear: clear, addContent: addContent};
	}

	modal = document.createElement('div');
	modal.setAttribute('id', 'testfairy-modal');
	modal.setAttribute('class', 'container');
	modal.style.position = 'fixed';
	modal.style.display = 'none';
	modal.style.width = '100%';
	modal.style.minHeight = '100%';
	modal.style.top = '0';
	modal.style.left = '0';
	modal.style.right = '0';
	modal.style.bottom = '0';
	modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
	modal.style.zIndex = '100';
	modal.style.cursor = 'pointer';
	modal.style.marginLeft = '0';
	modal.style.marginRight = '0';
	modal.style.overflow = 'scroll';

	var row = document.createElement('div');
	row.setAttribute('class', 'row');
	modal.appendChild(row);

	var column = document.createElement('div');
	column.setAttribute('class', 'column col-lg-6');
	column.style.float = 'none';
	column.style.minHeight = '80%';
	column.style.marginTop = '64px';
	column.style.marginLeft = 'auto';
	column.style.marginRight = 'auto';
	column.style.marginBottom = '64px';
	column.style.backgroundColor = 'white';
	column.style.scrollY = 'auto !important';
	column.style.overflow = 'scroll';
	row.appendChild(column);

	document.body.appendChild(modal);

	return {element: modal, show: show, hide: hide, clear: clear, addContent: addContent};
}

function insertAfter(elem, refElem) {
	return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}

function httpGetAsync(theUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			callback(xmlHttp.responseText.toString());
		} else if (xmlHttp.readyState == 4) {
			callback();
		}
	}

	xmlHttp.open("GET", theUrl, true); // true for asynchronous
	xmlHttp.send(null);
}

function isHex(num) {
  return Boolean(num.match(/^(0x)?[0-9a-f]+$/i));
}

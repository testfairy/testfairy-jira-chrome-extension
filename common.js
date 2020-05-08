function createIFrame(url, width, height, overflow) {
	var h2 = document.createElement('h2');
	h2.setAttribute("class", "toggle-title");
	h2.textContent = "TestFairy information";

	var heading = document.createElement('div');
	heading.setAttribute("class", "mod-header");
	heading.appendChild(h2);

	var iframe = document.createElement('iframe');
	iframe.setAttribute('id', 'testfairy-iframe');
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
	parent.appendChild(heading);
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

function insertAfter(elem, refElem) {
  return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}

function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      callback(xmlHttp.responseText.toString());
		} else if (xmlHttp.readyState == 4) {
			callback();
		}
  }

  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}

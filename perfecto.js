// atomic counter for pending ajax calls, used to block periodic timer for extension racing with existing uncomplete processing
var perfectoBusy = 0;

function getPerfectoHiddenAuthIframeSelector() {
	return 'iframe[title="keycloak-session-iframe"]';
}

function getPerfectoDeviceLogsLinkSelector() {
	return 'a[data-aid="download-menu-item-DEVICE_LOGS"]';
}

function isPerfectoTab() {
	var perfectoAuthIframes = document.querySelectorAll(getPerfectoHiddenAuthIframeSelector());
	var perfectoDeviceLogsLink = document.querySelector(getPerfectoDeviceLogsLinkSelector());

	// <iframe src="https://auth.perfectomobile.com/auth/realms/partners-perfectomobile-com/protocol/openid-connect/login-status-iframe.html" title="keycloak-session-iframe" style="display: none;"></iframe>
	var hiddenIframeFoundAndBelongsToPerfecto = false;
	var deviceLogsAvailable = false;

	for (var i = 0; i < perfectoAuthIframes.length; i++) {
		if (
			perfectoAuthIframes[i].src && perfectoAuthIframes[i].src.indexOf('perfectomobile') >= 0
		) {
			hiddenIframeFoundAndBelongsToPerfecto = true;
			break;
		}
	}

	if (perfectoDeviceLogsLink) {
		deviceLogsAvailable = perfectoDeviceLogsLink.parentNode.className.indexOf('disabled') == -1
	}

	return hiddenIframeFoundAndBelongsToPerfecto && deviceLogsAvailable;
}

var cleanPerfectoIfNecessary = function() {};

function addPerfectoIFrame() {
	if (perfectoBusy === 0) {
		if (!document.querySelector(getPerfectoDeviceLogsLinkSelector())) {
			return;
		}

		let url = document.querySelector(getPerfectoDeviceLogsLinkSelector()).getAttribute('data-href');
		if (url && url.length > 0) {
			url = document.location.origin + url;

			perfectoBusy++;
			httpGetAsync(url, function(logsZipFileContent) {
				if (logsZipFileContent) {

					// Load downloaded zip
					var outerZip = new JSZip();
					outerZip.loadAsync(logsZipFileContent, { base64: false })
						.then(function(zip) {
							// Traverse through the loaded blob to see if there is a zip
							var zipFileName = null;
							zip.forEach(function(zipFile) {
								if (!zipFileName) {
									zipFileName = zipFile
								}
							});

							// Get found inner zip
							return zip.file(zipFileName).async("blob");
						})
						.then(function(logsFile) {
							// Load newly found inner zip
							var zip = new JSZip();
							return zip.loadAsync(logsFile, { base64: false });
						})
						.then(function(zip) {
							// Get logs file from the final inner zip
							return zip.file('device.log').async('string');
						})
						.then(function(logs) {
							// Find session response line
							var sessionResponseLineIndex = logs.search('Received: ');
							var isTestFairyLog = sessionResponseLineIndex >= 0 && logs.slice(sessionResponseLineIndex - 19, sessionResponseLineIndex).indexOf('TESTFAIRYSDK') >= 0;

							if (sessionResponseLineIndex >= 0 && isTestFairyLog) {
								// Extract session url from session response json, parse it first
								var logsStartingFromResponseLine = logs.slice(sessionResponseLineIndex + 10);
								var nextNewLineIndex = logsStartingFromResponseLine.indexOf('\n');
								var sessionResponseJsonString = logsStartingFromResponseLine.slice(0, nextNewLineIndex).replace('\r', '');
								var sessionResponse = JSON.parse(sessionResponseJsonString);
								var sessionUrl = sessionResponse.sessionUrl;

								if (sessionUrl) {
									// Inject iframe
									sessionUrl = convertSessionUrlToIFrameUrl(sessionUrl, 'source=perfecto');;
									var iFrame = createIFrame(sessionUrl, getTestFairyCommonIFrameId());
									var root = document.querySelector('#root').children[0];
									iFrame.style.width = '700px';
									iFrame.style.marginLeft = 'auto';
									iFrame.style.marginRight = 'auto';
									iFrame.style.textAlign = 'center';

									insertAfter(iFrame, root);

									// Observe window.location to be able to remove iframe when not relevant (perfecto is SPA)
									cleanPerfectoIfNecessary = function() {
										if (window.location.pathname.indexOf('reporting/test') === -1) {
											cleanPerfectoIfNecessary = function() {};
											iFrame.remove();
										} else {
											setTimeout(cleanPerfectoIfNecessary, 1000);
										}
									};

									setTimeout(cleanPerfectoIfNecessary, 1000);
								}
							}

							perfectoBusy--;
						})
						.catch(function(ex) {
							console.error(ex);
							perfectoBusy--;
						})
				}
			}, true);
		}
	}
}

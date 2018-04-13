
var saveAppPrefsCallback = undefined; //4/24/15 by DW
var pathAppPrefs = "appPrefs.json";

function prefsToStorage () {
	var jsontext = JSON.stringify (appPrefs, undefined, 4), whenstart = new Date ();
	localStorage.appPrefs = jsontext;
	if (getBoolean (appPrefs.flServerBasedPrefs)) {
		twUploadFile (pathAppPrefs, jsontext, "application/json", true, function (data) {
			var archivepath = getDatePath (whenstart) + pathAppPrefs;
			twUploadFile (archivepath, jsontext, "application/json", true, function (data) {
				console.log ("prefsToStorage: uploaded \"" + archivepath + "\" to server in " + secondsSince (whenstart) + " secs.");
				});
			});
		}
	}
function storageToPrefs (callback) {
	if (getBoolean (appPrefs.flServerBasedPrefs)) {
		var whenstart = new Date ();
		twGetFile (pathAppPrefs, true, true, function (error, data) {
			if (data != undefined) {
				var storedPrefs = JSON.parse (data.filedata);
				for (var x in storedPrefs) {
					appPrefs [x] = storedPrefs [x];
					}
				console.log ("storageToPrefs: downloaded from server in " + secondsSince (whenstart) + " secs.");
				if (callback != undefined) { //8/16/14 by DW
					callback ();
					}
				}
			else { //call the callback even on an error
				if (callback != undefined) { 
					var errorInfo = {
						flFileNotFound: false
						};
					if (error.status == 500) {
						var s3response = JSON.parse (error.responseText);
						if (s3response.code == "NoSuchKey") {
							errorInfo.flFileNotFound = true;
							}
						}
					callback (errorInfo);
					}
				}
			});
		}
	else {
		if (localStorage.appPrefs != undefined) {
			var storedPrefs = JSON.parse (localStorage.appPrefs);
			for (var x in storedPrefs) {
				appPrefs [x] = storedPrefs [x];
				}
			}
		if (callback != undefined) { //11/6/14 by DW
			callback ();
			}
		}
	}
function storageStartup (callback) { //11/7/14 by DW
	storageToPrefs (function (errorInfo) {
		var flStartupFail = false;
		if (errorInfo != undefined) { 
			console.log ("storageStartup: errorInfo == " + jsonStringify (errorInfo));
			if (errorInfo.flFileNotFound != undefined) {
				if (!errorInfo.flFileNotFound) { //some error other than file-not-found (which is a benign error, first-time user
					if (callback != undefined) { //startup fail
						callback (false);
						flStartupFail = true;
						}
					}
				}
			}
		if (!flStartupFail) {
			if (callback != undefined) { //good start
				callback (true);
				}
			}
		});
	}
function prefsToCookie () {
	prefsToStorage ();
	}
function twitterToPrefs (twitterUserInfo) { //fill in RSS prefs from Twitter -- 8/7/14 by DW
	if (!appPrefs.flRssPrefsInitialized) {
		appPrefs.rssTitle = twitterUserInfo.name;
		appPrefs.rssDescription = twitterUserInfo.description;
		appPrefs.flRssPrefsInitialized = true;
		appPrefs.rssLink = twitterUserInfo.url;
		prefsToStorage ();
		twDerefUrl (twitterUserInfo.url, function (longUrl) { //try to unshorten the URL
			appPrefs.rssLink = longUrl;
			prefsToStorage ();
			});
		}
	}
function prefsDialogShow (saveCallback) {
	saveAppPrefsCallback = saveCallback; //4/24/15 by DW
	
	try { //6/7/14 by DW
		concord.stopListening (); //3/11/13 by DW
		}
	catch (err) {
		}
	
	$("#idPrefsDialog").modal ('show'); 
	prefsSetDefaultValues (); //3/9/17 by DW
	
	$("#idPrefsDialog").on ("keydown", function (event) { //1/26/15 by DW
		if (event.which == 13) {
			prefsOkClicked ();
			return (false);
			}
		});
	};
function prefsCloseDialog (event) {
	try { //6/7/14 by DW
		concord.resumeListening (); //3/11/13 by DW
		}
	catch (err) {
		}
	
	if (event !== undefined) { //4/11/16 by DW
		event.stopPropagation ();
		}
	
	$("#idPrefsDialog").modal ('hide'); 
	};
function prefsGetValuesFromDialog () {//11/23/15 by DW
	var inputs = document.getElementById ("idPrefsDialog").getElementsByTagName ("input"), i;
	for (var i = 0; i < inputs.length; i++) {
		if (inputs [i].type == "checkbox") {
			appPrefs [inputs [i].name] = inputs [i].checked;
			}
		else {
			appPrefs [inputs [i].name] = inputs [i].value;
			}
		}
	
	var textareas = document.getElementById ("idPrefsDialog").getElementsByTagName ("textarea"), i;
	for (var i = 0; i < textareas.length; i++) {
		appPrefs [textareas [i].name] = textareas [i].value;
		}
	}
function prefsSetDefaultValues () { //3/9/17 by DW
	var inputs = document.getElementById ("idPrefsDialog").getElementsByTagName ("input"), i;
	for (var i = 0; i < inputs.length; i++) {
		if (appPrefs [inputs [i].name] != undefined) {
			if (inputs [i].type == "checkbox") {
				inputs [i].checked = appPrefs [inputs [i].name];
				}
			else {
				inputs [i].value = appPrefs [inputs [i].name];
				}
			}
		}
	
	var textareas = document.getElementById ("idPrefsDialog").getElementsByTagName ("textarea"), i;
	for (var i = 0; i < textareas.length; i++) {
		if (appPrefs [textareas [i].name] != undefined) {
			textareas [i].value = appPrefs [textareas [i].name];
			}
		}
	}
function prefsOkClicked () {
	prefsGetValuesFromDialog (); //11/23/15 by DW
	
	
	prefsCloseDialog ();
	
	try { //1/9/18 by DW -- it's a pain to always have to set this up, now you don't ;-)
		applyPrefs ();
		}
	catch (err) {
		}
	
	if (saveAppPrefsCallback === undefined) { //4/24/15 by DW
		prefsToCookie ();
		}
	else {
		saveAppPrefsCallback ();
		}
	};
function getStoredPrefs (callback) { //9/6/14 by DW
	var whenstart = new Date ();
	twGetFile (pathAppPrefs, true, true, function (error, data) {
		if (data != undefined) {
			var storedPrefs = JSON.parse (data.filedata);
			for (var x in storedPrefs) {
				appPrefs [x] = storedPrefs [x];
				}
			console.log ("getStoredPrefs: downloaded from server in " + secondsSince (whenstart) + " secs.");
			if (callback != undefined) { //8/16/14 by DW
				callback ();
				}
			}
		else { //don't call the callback on an error, just put up an alert. hope the user follows our advice! ;-)
			if (callback != undefined) { 
				var responsestruct = JSON.parse (error.responseText);
				alert ("Error connecting to server: \"" + responsestruct.message + "\" Please reload the page to try again.");
				}
			}
		});
	}
$(document).ready (function () {
	$("#idPrefsDialog").bind ('show', function () {
		prefsSetDefaultValues ();
		});
	});

var myProductName = "feedViewer", myVersion = "0.40a";

var urlServer = "http://river5.scripting.com/getfeedriver?url=";

var urlRiverJson = "http://localhost:1337/getfeedriver?url=http://scripting.com/rss.xml";

var globalFeedStruct;

const lastUpdateFormat = "%A, %B %e, %Y at %l:%M %p";


var ixLastCursor = undefined;
var idItemPrefix = "idItem_";


function notEmpty (s) {
	if (s === undefined) {
		return (false);
		}
	if (s.length == 0) {
		return (false);
		}
	return (true);
	}
function setCursor (ixInArray, flCursorOnItem) {
	if (ixInArray !== undefined) {
		var item = $("#" + idItemPrefix + ixInArray);
		if (flCursorOnItem) {
			item.addClass ("itemHighlighted");
			}
		else {
			item.removeClass ("itemHighlighted");
			}
		}
	}
function moveCursorTo (ixInArray) {
	if (ixLastCursor !== undefined) {
		setCursor (ixLastCursor, false);
		}
	setCursor (ixInArray, true);
	ixLastCursor = ixInArray;
	$("#idItemContent").html (renderItemContent (globalFeedStruct.title, globalFeedStruct.items [ixInArray]));
	}
function moveCursorUp () {
	if (ixLastCursor >= globalFeedStruct.items.length - 1) {
		speakerBeep ();
		}
	else {
		moveCursorTo (ixLastCursor + 1);
		}
	}
function moveCursorDown () {
	if (ixLastCursor <= 0) {
		speakerBeep ();
		}
	else {
		moveCursorTo (ixLastCursor - 1);
		}
	}
function renderFeedtem (item, arrayIndex) {
	var htmltext = "", indentlevel = 0;
	function add (s) {
		htmltext +=  filledString ("\t", indentlevel) + s + "\n";
		}
	
	add ("<div class=\"divFeedItem\" id=\"" + idItemPrefix + "" + arrayIndex + "\">"); indentlevel++;
	
	if (notEmpty (item.title)) {
		add ("<div class=\"divItemTitle\">" + item.title + "</div>");
		}
	if (notEmpty (item.body)) {
		add ("<div class=\"divItemBody\">" + maxStringLength (item.body, 140, true, false) + "</div>");
		}
	
	
	add ("<div class=\"divWhenItem\" data-ix=\"" + arrayIndex + "\">" + getFacebookTimeString (item.pubDate) + "</div>");
	
	
	add ("</div>"); indentlevel--;
	
	return (htmltext);
	}
function renderItemContent (feedTitle, item) {
	var htmltext = "", indentlevel = 0;
	function add (s) {
		htmltext +=  filledString ("\t", indentlevel) + s + "\n";
		}
	function getItemLink () {
		if (notEmpty (item.permalink)) {
			return (item.permalink);
			}
		else {
			if (notEmpty (item.link)) {
				return (item.link);
				}
			else {
				return (undefined);
				}
			}
		}
	
	var pubDateString = formatDate (item.pubDate, lastUpdateFormat) + ".";
	add ("<div class=\"divContentPubDateLine\">" + pubDateString + "</div>");
	
	if (false) { //(item.outline !== undefined) {
		var outlineHtml = renderOutlineBrowser (item.outline, false, undefined, undefined, true);
		return ("<div class=\"divOutlineContainer\"><div class=\"divOutlineDisplayer divtypeblogpost\">" + outlineHtml + "</div></div>");
		}
	else {
		if (notEmpty (item.title)) {
			
			var titleLink = item.title, link = getItemLink ();
			if (link !== undefined) {
				titleLink = "<a href=\"" + link + "\">" + titleLink + "</a>";
				}
			
			add ("<div class=\"divContentTitle\">" + titleLink + "</div>");
			}
		if (item.fullDescription !== undefined) {
			add ("<div class=\"divFullDescription\">" + item.fullDescription + "</div>");
			}
		else {
			add ("<div class=\"divFullDescription\">" + item.description + "</div>");
			}
		}
	return (htmltext);
	}
function displayFeed (urlRiverJson) {
	readHttpFile (urlRiverJson, function (jsontext) {
		var jstruct = JSON.parse (jsontext);
		function getNewstPubdate () {
			var d = new Date (0);
			for (var i = 0; i < jstruct.items.length; i++) {
				var item = jstruct.items [i], thisDate = new Date (item.pubdate);
				if (thisDate > d) {
					d = thisDate;
					}
				}
			return (d);
			}
		$("#idFeedTitle").html ("<a href=\"" + jstruct.link + "\" title=\"" + jstruct.description + "\" data-toggle=\"tooltip\">" + jstruct.title + "</a>");
		$("#idWhenLastNewItem").html ("Last new item: " + formatDate (getNewstPubdate (), lastUpdateFormat) + ".");
		
		for (var i = jstruct.items.length - 1; i >= 0; i--) {
			var item = jstruct.items [i];
			if (item.pubDate === undefined) {
				item.pubDate = item.pubdate;
				}
			item.body = item.description;
			
			$("#idFeedItems").append (renderFeedtem (item, i));
			}
		
		globalFeedStruct = jstruct;
		
		$('[data-toggle="tooltip"]').tooltip (); 
		
		moveCursorTo (jstruct.items.length - 1);
		$(".divFeedItem").click (function () {
			var id = $(this).attr ("id");
			var ixarray = Number (stringNthField (id, "_", 2));
			console.log ("id == " + id + ", ixarray == " + ixarray);
			moveCursorTo (ixarray);
			console.log (jsonStringify (jstruct.items [ixarray]));
			event.stopPropagation ();
			event.preventDefault ();
			});
		});
	}

function updateTimes () {
	var whenstart = new Date ();
	$(".divWhenItem").each (function () {
		var ix = Number ($(this).data ("ix"));
		var pubDate = globalFeedStruct.items [ix].pubDate;
		$(this).html (getFacebookTimeString (pubDate));
		});
	console.log ("updateTimes: " + secondsSince (whenstart) + " secs.");
	}
function everyMinute () {
	console.log ("everyMinute: " + new Date ().toLocaleTimeString ());
	updateTimes ();
	}
function everySecond () {
	}
function startup () {
	var urlParam = getURLParameter ("url"), serverParam = getURLParameter ("server");
	console.log ("startup");
	hitCounter ();
	initGoogleAnalytics (window.location.hostname);
	if (serverParam != "null") { 
		urlServer = "http://" + serverParam + "/getfeedriver?url=";
		}
	if (urlParam != "null") { 
		urlRiverJson = urlServer + urlParam;
		}
	displayFeed (urlRiverJson);
	$("body").keydown (function (ev) {
		console.log ("keydown == " + ev.which);
		switch (ev.which) {
			case 37: //left arrow
				break;
			case 38: //up arrow
				moveCursorUp ();
				break;
			case 39: //right arrow
				break;
			case 40: //down arrow
				moveCursorDown ();
				break;
			}
		ev.stopPropagation ();
		ev.preventDefault ();
		});
	self.setInterval (everySecond, 1000); 
	self.setInterval (everyMinute, 60000); 
	}

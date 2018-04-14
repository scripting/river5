//code that displays an outline jstruct in javascript



var outlineBrowserData = {
	version: "0.5.1",
	serialNum: 0,
	flTextBasedPermalinks: true, //1/26/17 by DW
	flProcessEmoji: true, //7/3/17 by DW
	expandCollapseCallback: function (idnum) { //9/22/17 by DW
		}
	}

function getExpansionState () {
	var theList = "";
	function stringDelete (s, ix, ct) {
		var start = ix - 1;
		var end = (ix + ct) - 1;
		var s1 = s.substr (0, start);
		var s2 = s.substr (end);
		return (s1 + s2);
		}
	$(".aOutlineWedgeLink i").each (function () {
		var flExpanded = $(this).hasClass ("fa-caret-down");
		if (flExpanded) {
			var id = $(this).attr ("id"); //something like idOutlineWedge17
			theList += stringDelete (id, 1, "idOutlineWedge".length) + ",";
			}
		});
	if (theList.length > 0) {
		theList = stringDelete (theList, theList.length, 1); //remove trailing comma
		}
	return (theList);
	}
function applyExpansionState (theList) {
	var splits = theList.split (",");
	for (var i = 0; i < splits.length; i++) {
		var idWedge = "#idOutlineWedge" + splits [i];
		var idLevel = "#idOutlineLevel" + splits [i];
		$(idWedge).attr ("class", "fa fa-caret-down");
		$(idWedge).css ("color", "silver");
		$(idLevel).css ("display", "block");
		}
	}

function ecOutline (idnum) { 
	var c = document.getElementById ("idOutlineWedge" + idnum), idUL = "#idOutlineLevel" + idnum;
	if (c.className == "fa fa-caret-down") {
		c.className = "fa fa-caret-right";
		c.style.color = "black";
		$(idUL).slideUp (75);
		}
	else {
		c.className = "fa fa-caret-down";
		c.style.color = "silver";
		$(idUL).slideDown (75, undefined, function () {
			
			$(idUL).css ("display", "block");
			
			});
		}
	outlineBrowserData.expandCollapseCallback (idnum); //9/22/17 by DW
	}
function riverGetPermalinkString (urlPermalink, permalinkString) {
	if (urlPermalink == undefined) {
		return ("");
		}
	if (permalinkString == undefined) { 
		permalinkString = "#";
		}
	return ("<div class=\"divOutlinePermalink\"><a href=\"" + urlPermalink + "\">" + permalinkString + "</a></div>");
	}
function renderOutlineBrowser (outline, flMarkdown, urlPermalink, permalinkString, flExpanded) {
	function stringLower (s) {
		if (s === undefined) { //1/26/15 by DW
			return ("");
			}
		s = s.toString (); //1/26/15 by DW
		return (s.toLowerCase ());
		}
	function isAlpha (ch) {
		return (((ch >= 'a') && (ch <= 'z')) || ((ch >= 'A') && (ch <= 'Z')));
		}
	function isNumeric (ch) {
		return ((ch >= '0') && (ch <= '9'));
		}
	function stripMarkup (s) { //5/24/14 by DW
		if ((s === undefined) || (s == null) || (s.length == 0)) {
			return ("");
			}
		return (s.replace (/(<([^>]+)>)/ig, ""));
		}
	function innerCaseName (text) { //8/12/14 by DW
		var s = "", ch, flNextUpper = false;
		text = stripMarkup (text); 
		for (var i = 0; i < text.length; i++) {
			ch = text [i];
			if (isAlpha (ch) || isNumeric (ch)) { 
				if (flNextUpper) {
					ch = ch.toUpperCase ();
					flNextUpper = false;
					}
				else {
					ch = ch.toLowerCase ();
					}
				s += ch;
				}
			else {
				if (ch == ' ') { 
					flNextUpper = true;
					}
				}
			}
		return (s);
		}
	function filledString (ch, ct) { //6/4/14 by DW
		var s = "";
		for (var i = 0; i < ct; i++) {
			s += ch;
			}
		return (s);
		}
	function getBoolean (val) { //12/5/13 by DW
		switch (typeof (val)) {
			case "string":
				if (val.toLowerCase () == "true") {
					return (true);
					}
				break;
			case "boolean":
				return (val);
			case "number":
				if (val == 1) {
					return (true);
					}
				break;
			}
		return (false);
		}
	function beginsWith (s, possibleBeginning, flUnicase) { 
		if (s.length == 0) { //1/1/14 by DW
			return (false);
			}
		if (flUnicase === undefined) {
			flUnicase = true;
			}
		if (flUnicase) {
			for (var i = 0; i < possibleBeginning.length; i++) {
				if (stringLower (s [i]) != stringLower (possibleBeginning [i])) {
					return (false);
					}
				}
			}
		else {
			for (var i = 0; i < possibleBeginning.length; i++) {
				if (s [i] != possibleBeginning [i]) {
					return (false);
					}
				}
			}
		return (true);
		}
	function hotUpText (s, url) { //7/18/14 by DW
		
		if (url === undefined) { //makes it easier to call -- 3/14/14 by DW
			return (s);
			}
		
		function linkit (s) {
			return ("<a href=\"" + url + "\" target=\"_blank\">" + s + "</a>");
			}
		var ixleft = s.indexOf ("["), ixright = s.indexOf ("]");
		if ((ixleft == -1) || (ixright == -1)) {
			return (linkit (s));
			}
		if (ixright < ixleft) {
			return (linkit (s));
			}
		
		var linktext = s.substr (ixleft + 1, ixright - ixleft - 1); //string.mid (s, ixleft, ixright - ixleft + 1);
		linktext = "<a href=\"" + url + "\" target=\"_blank\">" + linktext + "</a>";
		
		var leftpart = s.substr (0, ixleft);
		var rightpart = s.substr (ixright + 1, s.length);
		s = leftpart + linktext + rightpart;
		return (s);
		}
	function debugNode (theNode) {
		var attstext = "";
		for (var x in theNode) {
			if ((x != "subs") && (x != "parent") && (x != "created")) {
				if (attstext.length > 0) {
					attstext +=  ", ";
					}
				attstext += x + "=" + theNode [x];
				}
			}
		return (attstext);
		}
	function getNodeType (theNode) {
		if (theNode.type == "include") {
			return (theNode.includetype); //this allows include nodes to have types
			}
		else {
			return (theNode.type);
			}
		}
	function getNameAtt (theNode) {
		var nameatt = theNode.name;
		if (nameatt === undefined) {
			nameatt = innerCaseName (theNode.text);
			}
		return (nameatt);
		}
	function typeIsDoc (theNode) {
		var type = getNodeType (theNode);
		return ((type !== undefined) && (type != "include") && (type != "link") && (type != "tweet"));
		}
	function getIcon (idnum, flcollapsed) {
		var wedgedir, color;
		if (flcollapsed) {
			wedgedir = "right";
			color = "black";
			}
		else {
			wedgedir = "down";
			color = "silver";
			}
		
		var clickscript = "onclick=\"ecOutline (" + idnum + ")\" ";
		var icon = "<span class=\"spOutlineIcon\"><a class=\"aOutlineWedgeLink\" " + clickscript + "><i class=\"fa fa-caret-" + wedgedir + "\" style=\"color: " + color + ";\" id=\"idOutlineWedge" + idnum + "\"></i></a></span>";
		return (icon);
		}
	function expandableTextLink (theText, idLevel) {
		return ("<a class=\"aOutlineTextLink\" onclick=\"ecOutline (" + idLevel + ")\">" + theText + "</a>");
		}
	var htmltext = "", indentlevel = 0, permalink = riverGetPermalinkString (urlPermalink, permalinkString), outlinelevel = 0;
	var markdown = new Markdown.Converter ();
	if (flMarkdown === undefined) {
		flMarkdown = false;
		}
	if (flExpanded === undefined) { //10/23/14 by DW
		flExpanded = riverBrowserData.flOutlinesExpandedByDefault; //4/16/15 by DW
		}
	function add (s) {
		htmltext += filledString ("\t", indentlevel) + s + "\r\n";
		}
	function getHotText (outline) {
		var origtext = outline.text;
		var s = hotUpText (outline.text, outline.url);
		if (s != origtext) {
			return (s);
			}
		else {
			if (getBoolean (outline.bold)) { //12/6/14 by DW
				s = "<span class=\"spBoldHead\">" + s + "</span>";
				}
			return (expandableTextLink (s, outlineBrowserData.serialNum));
			}
		}
	function hasSubs (outline) {
		return (outline.subs != undefined) && (outline.subs.length > 0);
		}
	function getImgHtml (outline) { //7/15/15 by DW
		if ((outline.type !== undefined) || (outline.img === undefined)) {
			return ("");
			}
		else {
			return ("<img style=\"float: right; margin-left: 24px; margin-top: 14px; margin-right: 14px; margin-bottom: 14px;\" src=\"" + outline.img +"\">");
			}
		}
	function gatherStylesFromOutline (outline) { //11/5/14 by DW
		var atts = new Object (), styles = new Object ();
		for (var x in outline) {
			switch (x) {
				case "color":
				case "direction":
				case "font-family":
				case "font-size":
				case "font-weight":
				case "letter-spacing":
				case "line-height":
				case "margin-left":
				case "text-decoration":
				case "text-shadow":
				case "text-transform":
				case "white-space":
				case "word-spacing":
					styles [x] = outline [x];
					break;
				}
			}
		return (styles);
		}
	function getStylesString (outline, flcollapsed) { //11/7/14 by DW
		var styles = gatherStylesFromOutline (outline), style = "";
		if (flcollapsed) {
			styles.display = "none";
			}
		for (var x in styles) {
			style += x + ": " + styles [x] + "; ";
			}
		if (style.length > 0) {
			style = " style=\"" + style + "\"";
			}
		return (style);
		}
	function getSubsMarkdownText (outline) {
		var s = "", style = getStylesString (outline, false);
		for (var i = 0; i < outline.subs.length; i++) {
			var child = outline.subs [i], img = "", imgatt;
			if (!getBoolean (child.isComment)) { //5/2/15 by DW
				s += getImgHtml (child) + child.text + "\r\r";
				if (hasSubs (child)) {
					s += getSubsMarkdownText (child);
					}
				}
			}
		return (s);
		}
	function getNodePermalink (theNode) { //6/5/16 by DW
		var permalinkstring = "";
		function textPermalink () {
			var theName = "", splits = stripMarkup (theNode.text).split (" ");
			for (var i = 0; i < splits.length; i++) {
				var ch = splits [i] [0];
				if (isAlpha (ch)) {
					theName += ch.toLowerCase ();
					}
				if (theName.length >= 4) {
					break;
					}
				}
			return (theName);
			}
		function datePermalink () {
			return (new Date (theNode.created).getTime ().toString ());
			}
		if (getBoolean (theNode.flPermalink)) {
			var theName = "", splits = stripMarkup (theNode.text).split (" ");
			if (outlineBrowserData.flTextBasedPermalinks) { //1/26/17 by DW
				theName = textPermalink ();
				}
			else {
				if (theNode.created !== undefined) {
					theName = datePermalink ();
					}
				else {
					theName = textPermalink ();
					}
				}
			permalinkstring = "<a name=\"" + theName + "\"></a><span class=\"spNodePermalink\"><a href=\"#" + theName + "\">" + "#" + "</a></span>";
			}
		return (permalinkstring);
		}
	function addChildlessSub (theNode, path) { //5/20/15 by DW
		if (typeIsDoc (theNode)) {
			add ("<li><div class=\"divOutlineText\"><a href=\"" + path + "\">" + theNode.text + "</a>" + getNodePermalink (theNode) + "</div></li>");
			}
		else {
			var type = getNodeType (theNode);
			switch (type) {
				case "link":
					add ("<li><div class=\"divOutlineText\"><a href=\"" + theNode.url + "\">" + theNode.text + "</a>" + getNodePermalink (theNode) + "</div></li>");
					break;
				default:
					add ("<li><div class=\"divOutlineText\">" + theNode.text + getNodePermalink (theNode) + "</div></li>");
					break;
				}
			}
		}
	function addSubs (outline, flcollapsed, path) {
		if (hasSubs (outline)) {
			var style = getStylesString (outline, flcollapsed), ulAddedClass = "";
			if (getBoolean (outline.flNumberedSubs)) { //6/23/17 by DW
				ulAddedClass = " ulNumberedSubs";
				}
			add ("<ul class=\"ulOutlineList" + ulAddedClass + " ulLevel" + outlinelevel + "\" id=\"idOutlineLevel" + outlineBrowserData.serialNum++ + "\"" + style + ">"); indentlevel++; outlinelevel++;
			for (var i = 0; i < outline.subs.length; i++) {
				var child = outline.subs [i], flchildcollapsed = getBoolean (child.collapse), img = getImgHtml (child);
				if (!beginsWith (child.text, "<rule")) { //5/28/15 by DW
					if (!getBoolean (child.isComment)) { //5/2/15 by DW
						var childpath = path + getNameAtt (child); //5/20/15 by DW
						if (hasSubs (child)) {
							add ("<li>"); indentlevel++;
							var textlink = expandableTextLink (child.text, outlineBrowserData.serialNum);
							add ("<div class=\"divOutlineText\">" + getIcon (outlineBrowserData.serialNum, flchildcollapsed) + img + textlink + getNodePermalink (child) + "</div>");
							addSubs (child, flchildcollapsed, childpath + "/");
							add ("</li>"); indentlevel--;
							}
						else {
							addChildlessSub (child, childpath);
							}
						}
					}
				}
			add ("</ul>"); indentlevel--; outlinelevel--;
			}
		}
	
	
	if (hasSubs (outline)) { //9/22/14 by DW
		var flTopLevelCollapsed = !flExpanded, theText = getHotText (outline);
		add ("<div class=\"divRenderedOutline\">"); indentlevel++;
		add ("<div class=\"divItemHeader divOutlineHead divOutlineHeadHasSubs\">" + getIcon (outlineBrowserData.serialNum, flTopLevelCollapsed) + theText + permalink + "</div>");
		
		if (flMarkdown) {
			var markdowntext = getSubsMarkdownText (outline), style = "";
			if (flTopLevelCollapsed) { //10/23/14 by DW
				style = " style=\"display: none;\"";
				}
			var opendiv = "<div class=\"divMarkdownSubs\" id=\"idOutlineLevel" + outlineBrowserData.serialNum++ + "\" " + style + ">";
			add (opendiv + markdown.makeHtml (markdowntext) + "</div>");
			}
		else {
			add ("<div class=\"divOutlineSubs\">"); indentlevel++;
			addSubs (outline, flTopLevelCollapsed, "");
			add ("</div>"); indentlevel--;
			}
		
		add ("</div>"); indentlevel--;
		
		outlineBrowserData.serialNum++; //9/22/14 by DW
		}
	else {
		add ("<div class=\"divRenderedOutline\">"); indentlevel++;
		add ("<div class=\"divItemHeader divOutlineHead\">" + hotUpText (outline.text, outline.url) + permalink + "</div>");
		add ("</div>"); indentlevel--;
		}
	
	
	return (htmltext);
	}

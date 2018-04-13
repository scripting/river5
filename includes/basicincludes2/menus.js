var twittericon = "<i class=\"fa fa-twitter\" style=\"color: #4099FF; font-weight: bold;\"></i>"; //7/22/14 by DW

function nukeDisabledMenuItems () { //11/16/15 by DW
	$(".dropdown-menu li").each (function () {
		if ($(this).hasClass ("disabled")) {
			$(this).children ().first ().attr ("onclick", ""); //nuke the command
			}
		});
	}
function initMenus () {
	document.getElementById ("idMenuProductName").innerHTML = appConsts.productnameForDisplay; 
	document.getElementById ("idMenuAboutProductName").innerHTML = appConsts.productnameForDisplay; 
	$("#idMenubar .dropdown-menu li").each (function () {
		var li = $(this);
		var liContent = li.html ();
		liContent = liContent.replace ("Cmd-", getCmdKeyPrefix ());
		li.html (liContent);
		});
	nukeDisabledMenuItems ();
	}
function initTwitterMenuItems () {
	twUpdateTwitterMenuItem ("idTwitterConnectMenuItem");
	twUpdateTwitterUsername ("idTwitterUsername");
	$("#idTwitterIcon").html (twittericon);
	}
function initFacebookMenuItems () {
	fbUpdateFacebookMenuItem ("idFacebookConnectMenuItem");
	}

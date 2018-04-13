var flConfirmDialogSetUp = false;
var confirmDialogCallback;

function setupConfirmDialog () {
	var s = 
		"<div class=\"divConfirmDialog\"><div id=\"idConfirmDialog\" class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"windowTitleLabel\" aria-hidden=\"true\" stylex=\"width: 450px; display: none;\"><img src=\"http://static.scripting.com/larryKing/images/2013/03/16/questionMarkIcon.gif\" width=\"42\" height=\"42\" alt=\"confirm icon\" style=\"float: left; margin-left: 15px; margin-top: 15px;\"><div id=\"idConfirmDialogPrompt\" style=\"font-size: 16px; line-height: 130%; margin-left: 65px; margin-top:15px; margin-right:15px;\"></div><a href=\"#\" class=\"btn btn-primary\" onclick=\"okConfirmDialog ();\" style=\"width: 70px; margin-bottom: 8px; margin-right: 15px; margin-top: 30px; float: right;\">OK</a><a href=\"#\" class=\"btn\" onclick=\"closeConfirmDialog ();\" style=\"width: 70px; margin-bottom: 8px; margin-right: 15px; margin-top: 30px; float: right;\">Cancel</a></div></div>"
	$("body").prepend (s)
	$("#idConfirmDialog").on ("keydown", function (event) { //5/6/13 by DW
		if (event.which == 13) {
			okConfirmDialog ();
			return (false);
			}
		});
	return (s);
	}
function closeConfirmDialog () {
	$("#idConfirmDialog").modal ('hide'); 
	};
function okConfirmDialog () {
	$("#idConfirmDialog").modal ('hide'); 
	confirmDialogCallback ();
	};
function confirmDialog (prompt, callback) {
	if (!flConfirmDialogSetUp) {
		setupConfirmDialog ();
		flConfirmDialogSetUp = true;
		}
	document.getElementById ("idConfirmDialogPrompt").innerHTML = prompt;
	confirmDialogCallback = callback;
	$("#idConfirmDialog").modal ("show");
	}

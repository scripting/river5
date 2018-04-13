var flAlertDialogSetUp = false, alertDialogCallback = undefined;

function setupAlertDialog () {
	var s = 
		"<div id=\"idAlertDialog\" class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"windowTitleLabel\" aria-hidden=\"true\" style=\"width: 450px; background-color: whitesmoke;\"><img src=\"http://static.scripting.com/larryKing/images/2013/04/13/alert.gif\" width=\"32\" height=\"32\" border=\"0\" alt=\"alert icon\" style=\"float: left; margin-left: 15px; margin-top: 15px;\"><div id=\"idAlertDialogPrompt\" style=\"font-size: 16px; line-height: 130%; margin-left: 65px; margin-top:15px; margin-right:15px;\"></div><a href=\"#\" class=\"btn btn-primary\" onclick=\"okAlertDialog ();\" style=\"width: 70px; margin-bottom: 8px; margin-right: 15px; margin-top: 30px; float: right;\">OK</a></div>"
	$("body").prepend (s);
	$("#idAlertDialog").on ("keydown", function (event) { //5/6/13 by DW
		if (event.which == 13) {
			okAlertDialog ();
			return (false);
			}
		});
	return (s);
	}
function okAlertDialog () {
	$("#idAlertDialog").modal ('hide'); 
	if (alertDialogCallback !== undefined) {
		alertDialogCallback ();
		}
	alertDialogCallback = undefined;
	};
function alertDialog (prompt, callback) {
	if (!flAlertDialogSetUp) {
		setupAlertDialog ();
		flAlertDialogSetUp = true;
		}
	document.getElementById ("idAlertDialogPrompt").innerHTML = prompt;
	$("#idAlertDialog").modal ("show");
	alertDialogCallback = callback;
	}

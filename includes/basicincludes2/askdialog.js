var flAskDialogSetUp = false;
var askDialogCallback;


function okAskDialog () {
	var input = document.getElementById ("idAskDialogInput");
	closeAskDialog ();
	askDialogCallback (input.value, false);
	};
function cancelAskDialog () {
	askDialogCallback ("", true);
	closeAskDialog ();
	}
function setupAskDialog (callback) {
	if (flAskDialogSetUp) {
		callback ();
		}
	else {
		readHttpFile ("http://fargo.io/code/node/shared/askdialog.html", function (s) {
			$("body").prepend (s);
			$("#idAskDialogInput").on ("keydown", function (event) { //3/22/13 by DW
				if (event.which == 13) {
					okAskDialog ();
					return (false);
					}
				});
			flAskDialogSetUp = true;
			callback ();
			});
		}
	}
function closeAskDialog () {
	$("#idAskDialog").modal ('hide'); 
	};
function askDialog (prompt, defaultvalue, placeholder, askcallback, type) {
	var input;
	if (defaultvalue === undefined) {
		defaultvalue = "";
		}
	if (placeholder === undefined) {
		placeholder = "";
		}
	if (type === undefined) {
		type = "text";
		}
	
	setupAskDialog (function () {
		input = document.getElementById ("idAskDialogInput");
		if (defaultvalue === undefined) {
			defaultvalue = "";
			}
		input.value = defaultvalue;
		input.type = type; 
		input.placeholder = placeholder;
		askDialogCallback = askcallback; 
		document.getElementById ("idAskDialogPrompt").innerHTML = prompt;
		$("#idAskDialog").on ("shown", function () {
			input.focus ();
			input.select ();
			});
		$("#idAskDialog").modal ("show");
		});
	
	
	}

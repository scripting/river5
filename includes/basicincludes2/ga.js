
var whenLastGoogleAnalyticsPing = new Date (0);


function initGoogleAnalytics (theDomain, theGoogleAccount) { //7/11/15 by DW -- new optional param
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	
	if (theDomain === undefined) { //7/11/15 by DW
		try {
			theDomain = appConsts.domain;
			}
		catch (err) {
			theDomain = window.location.hostname;
			}
		}
	if (theGoogleAccount === undefined) { //8/8/16 by DW
		theGoogleAccount = "UA-39531990-1";
		}
	
	ga('create', theGoogleAccount, theDomain);
	ga('send', 'pageview');
	}
function pingGoogleAnalytics () {
	if (secondsSince (whenLastGoogleAnalyticsPing) >= 300) { //ping google analytics every 5 minutes
		if (secondsSince (whenLastUserAction) <= 300) { //don't ping if the user isn't doing anything
			ga ("send", "pageview");
			}
		whenLastGoogleAnalyticsPing = new Date ();
		}
	}

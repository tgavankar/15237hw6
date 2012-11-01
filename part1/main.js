var app = null;

$(document).bind('pageinit', function(e) {
	if(app == null) {
		app = new SignUpApp();
	}
	var activePage = $(e.target);
	console.log(activePage);
	/*if(!app.isHuman) {
		app.doCaptcha();
		$.mobile.changePage('#one');
	}*/
});

var SignUpApp = function() {
	this.isHuman = false;
}

SignUpApp.prototype.doCaptcha = function() {
	if(confirm('are you')) {
		this.isHuman = true;
	}
}
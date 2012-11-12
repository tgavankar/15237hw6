var app = null;

var swipes = ["swipeleft", "swiperight"]


/**
 * Bind to pageshow instead of document.ready() for JQM
 */
$(document).live('pageshow', function(e) {
	if(app == null) {
		app = new SignUpApp();
		app.init();
	}

	if(!app.isHuman) {
		var activePage = $(e.target);
		if(activePage.attr('id') == "captcha") {			
			app.doCaptcha();
		}
		else if(activePage.attr('id') !== "home") {
			$.mobile.changePage('#captcha');
		}
	}
	else if($(e.target).attr('id') == "captcha") {
		$.mobile.changePage('#info');
	}
	else if($(e.target).attr('id') == "confirm") {
		$('#conffriends').listview();
		$('#conffriends').listview('refresh');
	}
});


/**
 * SignUpApp prototype
 */
var SignUpApp = function() {

}

SignUpApp.prototype.init = function() {
	this.initData();
	this.initHandlers();
	this.initGuiState();
}

SignUpApp.prototype.initData = function() {
	this.isHuman = false;

	this.name = '';
	this.age = '';
	this.gender = '';
	this.email = '';
	this.state = '';
	this.friends = [];
}

SignUpApp.prototype.initHandlers = function() {
	this.initSubmitInfoHandler();
	this.initAddFriendHandler();
	this.initRemoveFriendsHandler();
	this.initSubmitFriendsHandler();
	this.initPageshowHandler();
}

SignUpApp.prototype.initGuiState = function() {
	this.disableTabsPreCaptcha();
}

SignUpApp.prototype.initSubmitInfoHandler = function() {
	var app = this;
	$('#info input[name=submit]').click(function(e) {
		e.preventDefault();
		if(isEmpty($('#info input[name=name]').val())) {
			$('#info input[name=name]').css('background-color', 'red');
			return;
		}
		
		if(isInvalidEmail($('#info input[name=email]').val())) {
			$('#info input[name=email]').css('background-color', 'red');
			return;
		}
		app.saveInfo();
		$.mobile.changePage('#friends');
	});
}

SignUpApp.prototype.initAddFriendHandler = function() {
	var app = this;
	$('#addfriend').live('click', function(e) {
		e.preventDefault();
		$('#friendlist li.friendname').last().after(getFriendNode(""));
		
		// Preserve JQM style/theme
		$('#friendlist').listview('refresh');
		$('#friends').trigger('create');
	});
}

SignUpApp.prototype.initRemoveFriendsHandler = function() {
	var app = this;
	$('#friendlist .remove').live('click', function(e) {
		e.preventDefault();
		var out = "";
		$('#friendlist li.friendname').each(function() {			
			if(this !== $(e.target).parent().parent()[0]) {
				out += getFriendNode($(this).find('input').val());
			}
		});
		
		out += getAddFriendButton();
		
		$('#friendlist').html(out);
		$('#friendlist').listview('refresh');
		$('#friends').trigger('create');
	});
}

SignUpApp.prototype.initSubmitFriendsHandler = function() {
	var app = this;
	$('#friends input[name=submit]').live('click', function(e) {
		e.preventDefault();
		
		var foundInvalid = false;

		$('.friendname input[name=friend]').each(function() {
			if(!isEmpty($(this).val()) && isJustInvalidEmail($(this).val())) {
				$(this).css('background-color', 'red');
				foundInvalid = true;
			}
			else {
				$(this).css('background-color', 'inherit');
			}
		});

		if(foundInvalid) {
			return;
		}

		app.saveFriends();
		$.mobile.changePage('#confirm');
	});
}	

SignUpApp.prototype.initPageshowHandler = function() {
	var app = this;

}

SignUpApp.prototype.disableTabsPreCaptcha = function() {
	$('div[data-role=navbar] a').slice(2).addClass('ui-disabled');
}

SignUpApp.prototype.enableTabs = function() {
	$('div[data-role=navbar] a').removeClass('ui-disabled');
}

SignUpApp.prototype.doCaptcha = function() {
	var swipe1 = swipes[Math.floor(Math.random()*swipes.length)];
	var swipe2 = swipes[Math.floor(Math.random()*swipes.length)];
	
	var captcha = ["tap", "tap", "tap", "tap"];
	
	var pos1 = Math.floor(Math.random()*captcha.length);
	var pos2 = Math.floor(Math.random()*captcha.length);
	
	while(pos2 == pos1) {
		pos2 = Math.floor(Math.random()*captcha.length);
	}
	
	captcha[pos1] = swipe1;
	captcha[pos2] = swipe2;
	
	this.captcha = captcha;
	
	var outlis = "";
	
	for(var i=0; i<this.captcha.length; i++) {
		outlis += '<li name="gesture' + i + '">' + this.captcha[i] + '</li>';
	}
	
	$('#captchagestures').text('');
	$('#captchagestures').append(outlis);
		
	this.captchaStep = 0;
	
	var ref = this;
	
	$('#captcha').bind('tap swipeleft swiperight taphold', function(e) {		
		if(e.type === "taphold") {
			ref.captchaStep += ref.captcha.length;
		} 
		else if(ref.captcha[ref.captchaStep] === e.type) {
			$('#captchagestures [name=gesture' + ref.captchaStep + ']').css('color', 'green').css('font-weight', 'bold');
			ref.captchaStep++;
		}
		else {
			ref.unbindCaptcha();
			$.mobile.changePage('#home');
		}
		
		if(ref.captchaStep >= ref.captcha.length) {
			ref.isHuman = true;
			ref.unbindCaptcha();
			ref.enableTabs();
			$.mobile.changePage('#info');
		}
	});
}

SignUpApp.prototype.unbindCaptcha = function() {
	$('#captcha').unbind();
}

SignUpApp.prototype.saveInfo = function() {
	this.name = $('#info input[name=name]').val();
	this.age = $('#info input[name=age]').val();
	this.gender = $('#info select[name=gender]').val();
	this.email = $('#info input[name=email]').val();
	this.state = $('#info select[name=state]').val();

	this.updateConfirm();
}

SignUpApp.prototype.saveFriends = function() {
	this.friends = [];

	var refFriends = this.friends;
	$('#friends input[name=friend]').each(function() {
		if(!isEmpty($(this).val())) {
			refFriends.push($(this).val());
		}
	});

	this.updateConfirm();
}

SignUpApp.prototype.updateConfirm = function() {
	$('#confinfo span[name=name]').text(this.name);
	$('#confinfo span[name=age]').text(this.age);
	$('#confinfo span[name=email]').text(this.email);
	$('#confinfo span[name=gender]').text(this.gender);
	$('#confinfo span[name=state]').text(this.state);

	$('#conffriends').html('');

	for(var i=0; i<this.friends.length; i++) {
		$('#conffriends').append($('<li>').text(this.friends[i]));
	}
}


/**
 * Global helper functions
 */
function isEmpty(str) {
	return (str === undefined || str === "");
}

function isJustInvalidEmail(str) {
	var re = /\S+@\S+\.\S+/;
	return !re.test(str)
}

function isInvalidEmail(str) {
	var re = /\S+@\S+\.\S+/;
	return (isEmpty(str) || !re.test(str))
}

function getFriendNode(val) {
	if(isEmpty(val)) {
		val = "";
	}
	return '<li class="friendname" data-role="fieldcontain"><a href="#"><input type="email" name="friend" value="' + val + '" /></a><a href="#" class="remove">Remove</a></li>';
}

function getAddFriendButton() {
	return '<li><input type="button" id="addfriend" value="Add Friend" /></li><li><input type="submit" value="Continue" name="submit" /></li>';
}
var app = null;

var swipes = ["swipeleft", "swiperight"]


$(document).ready(function() {
	if(app == null) {
		app = new SignUpApp();
	}
	
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
		console.log("submitted");
		app.saveInfo();
		$.mobile.changePage('#friends');
	});
	
	$('#addfriend').live('click', function(e) {
		e.preventDefault();
		console.log('a');
		$('#friendlist li.friendname').last().after(getFriendNode(""));
		
		// Preserve JQM style/theme
		$('#friendlist').listview('refresh');
		$('#friends').trigger('create');
	});
	
	$('#friendlist .remove').live('click', function(e) {
		e.preventDefault();
		var out = "";
		$('#friendlist li.friendname').each(function() {			
			if($(this) !== $(e.target).parent().parent()) {
				out += getFriendNode($(this).children('input').val());
			}
		});
		
		out += getAddFriendButton();
		
		$('#friendlist').html(out);
		$('#friendlist').listview('refresh');
		$('#friends').trigger('create');
	});
});

function isEmpty(str) {
	return (str === undefined || str === "");
}

function isInvalidEmail(str) {
	var re = /\S+@\S+\.\S+/;
	return (isEmpty(str) || !re.test(str))
}

function getFriendNode(val) {
	return '<li class="friendname" data-role="fieldcontain"><a href="#"><input type="text" name="friend" value="' + val + '" /></a><a href="#" class="remove">Remove</a></li>';
}

function getAddFriendButton() {
	return '<li><input type="button" id="addfriend" value="Add Friend" /></li>';
}

$(document).live('pageshow', function(e) {
	if(app == null) {
		app = new SignUpApp();
	}
	if(!app.isHuman) {
		var activePage = $(e.target);
		if(activePage.attr('id') == "captcha") {
			var links = activePage.find('div[data-role=navbar] a');
			links.addClass('ui-disabled');
		
			app.doCaptcha();
		
		}
		else if(activePage.attr('id') !== "home") {
			$.mobile.changePage('#captcha');
		}
	}
	else if($(e.target).attr('id') == "captcha") {
		$.mobile.changePage('#info');
	}
});

var SignUpApp = function() {
	this.isHuman = true;
}

SignUpApp.prototype.doCaptcha = function() {
	console.log('captcha');
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
		outlis += '<li>' + this.captcha[i] + '</li>';
	}
	
	$('#captchagestures').text('');
	$('#captchagestures').append(outlis);
		
	this.captchaStep = 0;
	
	var ref = this;
	
	$('#captcha').bind('tap swipeleft swiperight taphold', function(e) {
		console.log(e.type);
		if(e.type === "taphold") {
			ref.captchaStep += ref.captcha.length;
		} 
		else if(ref.captcha[ref.captchaStep] === e.type) {
			ref.captchaStep++;
		}
		else {
			ref.unbindCaptcha();
			$.mobile.changePage('#home');
		}
		
		if(ref.captchaStep >= ref.captcha.length) {
			ref.unbindCaptcha();
			$('#captcha').find('div[data-role=navbar] a').addClass('ui-disabled');
			$.mobile.changePage('#info');
			ref.isHuman = true;
		}
	});
}

SignUpApp.prototype.unbindCaptcha = function() {
	$('#captcha').unbind('tap swipeleft swiperight');
}

SignUpApp.prototype.saveInfo = function() {
	this.name = $('#info input[name=name]').val()
	this.age = $('#info input[name=age]').val()
	this.gender = $('#info select[name=gender]').val()
	this.email = $('#info select[name=email]').val()
	this.state = $('#info input[name=state]').val()
}
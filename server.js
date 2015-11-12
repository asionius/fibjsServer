var http = require('http');
var mq = require('mq');
var websocket = require('websocket');
var email = require("utils/email");
var note = require("utils/note");
var hdlr = new mq.Chain([
	function(v) {},
	new mq.Routing({
		'^/teambition(/.*)$': require("utils/teambition"),
		'^/sendemail(/.*)$': email.notify,
		'^/setnote(/.*)$': note.put,
		'^(/.*)$': new mq.Chain([http.fileHandler('./www'), function(v) {}])
	}),
	function(v) {}
]);

var svr = new http.Server('', 80, hdlr);
svr.crossDomain = true;
svr.run();
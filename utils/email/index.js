var rpc = require("rpc");
var response = require("utils/response");
var net = require('net');
var smtp = new net.Smtp();
var name = 'teambition@baoz.cn',
	title = 'teambition任务通知',
	to = ['vicky@baoz.cn'];


smtp.connect('smtp.exmail.qq.com', 25);
smtp.hello();
smtp.login('aike.wang@baoz.cn', 'wak.926424');

smtp.quit();
module.exports = {
	notify: function(v) {
		var params = v.form.toJSON();
		var email = params.email;
		var content = params.content;
		to.unshift(email);

		var MIME = "";
		// -------MIME---------
		MIME += "from:" + name + "\r\n";
		MIME += "to:" + to.join(",") + "\r\n";
		MIME += "subject:" + title + "\r\n";
		MIME += "MIME-Version:1.0\r\n";
		MIME += "Content-Type:multipart/mixed;boundary=#华丽的分割线#;\r\n";
		// -------CONTENT---------
		MIME += "\r\n--#华丽的分割线#\r\n";
		MIME += "Content-Type:text/plain;charset=utf8\r\n";
		MIME += "Content-Transfer-Encoding:7bit\r\n";
		MIME += "\r\n" + content + "\r\n";
		MIME += "\r\n--#华丽的分割线#--\r\n";
		smtp.from('teambition@baoz.cn');
		smtp.to(email);
		smtp.to(to[0]);
		smtp.data(MIME);
	}
}
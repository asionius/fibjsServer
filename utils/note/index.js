var util = require("util");
var coroutine = require("coroutine");
var operate = require("utils/teambition/teamBitionClient.js");
var response = require("utils/response");
var client = operate();

module.exports = {
	put: function(v) {
		var data = v.form.toJSON();
		data = JSON.parse(util.keys(data)[0]);
		var taskid = data.taskid,
			note = {
				'note': JSON.stringify(data.note)
			}
		var r = client.setTaskNote(taskid, note);
		response.amd(v, r);
	}
}
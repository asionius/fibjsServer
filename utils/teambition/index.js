var util = require("util");
var coroutine = require("coroutine");
var operate = require("./teamBitionClient.js");
var response = require("utils/response");
var partment = require("./partment.js");
var P = require("./P.json");
var M = require("./M.json");
var encoding = require('encoding');
var searchPersonTasks = require("./analysis.js").searchPersonTasks;
var performance = require("./analysis.js").performance;
var getTaskList = require("./analysis.js").getTaskList;
var fs = require('fs');
var bigData = fs.readFile('./bigData.json');
bigData = JSON.parse(bigData);
var client = operate();

var lruCache = new util.LruCache(1000, 1000 * 60 * 60);

var refresh = function() {
	coroutine.start(function() {
		var projectInfo = JSON.parse(client.getProjectInfo());
		var project = {};

		// coroutine.parallel(projectInfo, function(p) {
		projectInfo.forEach(function(p) {
			var pName = p.name,
				pId = p._id,
				personInfo = JSON.parse(client.getPersonInfo(pId));
			project[pName] = {};

			// coroutine.parallel(personInfo, function(person) {
			personInfo.forEach(function(person) {
				project[pName][person.title] = {};

				var personalTaskList = JSON.parse(client.getPersonalTaskList(person._id));
				// coroutine.parallel(personalTaskList, function(taskList) {
				personalTaskList.forEach(function(taskList) {
					var ts = [],
						isEnd = false;
					project[pName][person.title][taskList.name] = ts;

					// if (taskList._id === personalTaskList[personalTaskList.length - 1]._id) {
					if (taskList.isLocked) {
						isEnd = true;
					}
					var tasks = JSON.parse(client.getTasks(taskList._id, isEnd));
					// coroutine.parallel(tasks, function(task) {
					tasks.forEach(function(task) {

						try {
							var note = client.getNoteByTaskId(task._id),
								content = {};
						} catch (e) {
							return;
						}

						var t = content[task.content] = {};
						t.executor = task.executor ? task.executor.name : "";
						t.note = note;
						t.projectid = pId;
						t.personid = person._id;
						t.id = task._id;
						if (isEnd) t.isEnd = 'true';
						ts.push(content);
					})
				})
			})
		});
		var result = {
			project: project,
			partment: partment,
			created: (new Date()).getTime()
		}
		fs.writeFile('./bigData.json', JSON.stringify(result));
		lruCache.clear();
		lruCache.set('root', result);
	})
	return 'refreshing ...';
}

var fillTeamBition = function() {
	if (bigData && (new Date()).getTime() - bigData.created < 1000 * 60 * 60) {
		return bigData;
	} else {
		var data = JSON.parse(fs.readFile('./bigData.json'));
		refresh();
		return data;
	}
}

var getObjByName = function(person) {
	person = person.split('_')[1];
	var obj = lruCache.get("root", fillTeamBition);
	return searchPersonTasks(person, obj);
}

var getPerformanceByPartmentName = function(partmentName) {
	partmentName = partmentName.split('_')[1];
	var obj = lruCache.get("root", fillTeamBition);
	return performance(P, partment, partmentName, obj, M);
}

var listTasks = function(partmentName) {
	partmentName = partmentName.split('_')[1];
	var obj = lruCache.get("root", fillTeamBition);
	return getTaskList(obj, partment, partmentName);
}

var getP = function() {
	return P;
}

var gettime = function() {
	return lruCache.get("root", fillTeamBition).created;
}
module.exports = function(v) {
	var teambition = {
		root: fillTeamBition,
		search: getObjByName,
		performance: getPerformanceByPartmentName,
		list: listTasks,
		P: getP
	};
	v.value = v.value ? encoding.decodeURI(v.value) : "";
	var ps = v.value.split('/'),
		a = ps[1],
		b = ps[2] ? a + '_' + ps[2] : a,
		r;
	switch (a) {
		case 'refresh':
			r = refresh();
			break;
		case 'gettime':
			r = gettime();
			break;
		default:
			r = lruCache.get(b, teambition[a]);
			break;
	}

	response.amd(v, r);
}
var util = require('util');

var analyze = function(person, obj) {
	var pms = [],
		result = {},
		projects = obj.project;
	util.keys(obj.partment).forEach(function(pm) {
		if (obj.partment[pm].indexOf(person) > -1) {
			pms.push(pm);
		}
	})
	result.person = person;
	result.partment = pms;
	result.tasks = [];
	util.keys(projects).forEach(function(project) {
		var proj = projects[project];
		util.keys(proj).forEach(function(key) {
			var item = proj[key];
			util.keys(item).forEach(function(st) {
				var stage = item[st];
				for (var t in stage) {
					var tasks = stage[t];
					for (var i in tasks) {
						var task = tasks[i];
						if (task.executor === person) {
							var taskObj = {};
							taskObj.name = i;
							taskObj.project = project;
							taskObj.projectid = task.projectid;
							taskObj.itemid = task.personid;
							taskObj.id = task.id;
							taskObj.stage = st;
							taskObj.comment = task.note;
							taskObj.isEnd = task.isEnd;
							taskObj.priority = task.note.set_priority ? task.note.set_priority.priority : 0;
							taskObj.executor = person;
							result.tasks.push(taskObj);
						} else if (person === '未指派') {
							if (!task.executor) {
								var taskObj = {};
								taskObj.name = i;
								taskObj.project = project;
								taskObj.projectid = task.projectid;
								taskObj.itemid = task.personid;
								taskObj.id = task.id;
								taskObj.stage = st;
								taskObj.comment = task.note;
								taskObj.isEnd = task.isEnd;
								taskObj.priority = task.note.set_priority ? task.note.set_priority.priority : 0;
								taskObj.executor = person;
								result.tasks.push(taskObj);
							}
						}
					}
				}
			})
		})
	});

	return result;
}

var sortTasks = function(info) {
	var taskList = [];
	info.forEach(function(p) {
		p.tasks.forEach(function(task) {
			if (!task.isEnd) taskList.push(task);
		});
	});
	return taskList.sort(function(a, b) {
		return a.priority > b.priority ? -1 : 1;
	});
}
var performance = function(P, partment, name, obj, M) {
	var infos = [];
	partment[name].forEach(function(person) {
		var personObj = analyze(person, obj);
		infos.push(personObj);

	});
	return {
		infos: infos,
		P: P
	};
}

var getTaskList = function(obj, partment, name) {
	var infos = [];
	partment['技术部'].forEach(function(person) {
		var personObj = analyze(person, obj);
		infos.push(personObj);
	});
	return sortTasks(infos);
}

module.exports = {
	analyze: analyze,
	performance: performance,
	getTaskList: getTaskList
};
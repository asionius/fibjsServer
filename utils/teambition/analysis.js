var util = require('util');

//兼容新旧备忘
var parseNote = function(note) {
	if (note && note.indexOf('v1.1001') !== -1) {
		var ret = {};
		note = JSON.parse(note);
		var pPerson = note.prod.person,
			tPerson = note.tech.person;
		if (pPerson.name) {
			var pbuf = [];
			pbuf.push(note.month);
			pbuf.push(pPerson.P + '*' + pPerson.time);
			pbuf.push(note.score);
			pbuf.push(note.pause);
			ret[pPerson.name] = pbuf.join('\r\n');
		}
		if (tPerson.name) {
			var tbuf = [];
			tbuf.push(note.month);
			tbuf.push(tPerson.P + '*' + tPerson.time);
			tbuf.push(note.score);
			tbuf.push(note.pause);
			ret[tPerson.name] = tbuf.join('\r\n');
		}
		return ret;
	} else return note;
}

//查询个人的任务
var searchPersonTasks = function(person, obj) {
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
							//旧的teambition接口
							// if (task.note.set_note) {
							// 	var note = parseNote(task.note.set_note.note);
							// 	if (util.isObject(note) && note[person]) task.note.set_note.note = note[person];
							// };
							if (task.newnote) {
								var note = parseNote(task.newnote);
								if (util.isObject(note) && note[person]) task.newnote = note[person];
							};
							taskObj.updated = task.updated;
							taskObj.created = task.created;
							taskObj.dueDate = task.dueDate;
							taskObj.note = task.newnote;
							taskObj.isEnd = task.isEnd;
							taskObj.priority = task.priority;
							taskObj.executor = person;
							taskObj.comment = task.note.comment;
							result.tasks.push(taskObj);
						} else {
							//旧数据格式
							// if (task.note.set_note) {
							// 	var note = parseNote(task.note.set_note.note);
							// 	if (util.isObject(note) && note[person]) task.note.set_note.note = note[person];
							// 	else continue;
							// } else continue;
							if (task.newnote) {
								var note = parseNote(task.newnote);
								if (util.isObject(note) && note[person]) task.newnote = note[person];
								else continue;
							} else continue;

							var taskObj = {};
							taskObj.name = i;
							taskObj.updated = task.updated;
							taskObj.created = task.created;
							taskObj.dueDate = task.dueDate;
							taskObj.project = project;
							taskObj.projectid = task.projectid;
							taskObj.itemid = task.personid;
							taskObj.id = task.id;
							taskObj.stage = st;
							taskObj.note = task.newnote;
							taskObj.isEnd = task.isEnd;
							taskObj.priority = task.priority;
							taskObj.executor = person;
							taskObj.comment = task.note.comment;
							result.tasks.push(taskObj);

						}
					}
				}
			})
		})
	});

	return result;
}

//查询任务列表
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
							taskObj.note = task.newnote;
							taskObj.isEnd = task.isEnd;
							taskObj.priority = task.priority;
							taskObj.updated = task.updated;
							taskObj.created = task.created;
							taskObj.dueDate = task.dueDate;
							taskObj.executor = person;
							taskObj.comment = task.note.comment;
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
								taskObj.note = task.newnote;
								taskObj.isEnd = task.isEnd;
								taskObj.priority = task.priority;
								taskObj.updated = task.updated;
								taskObj.created = task.created;
								taskObj.dueDate = task.dueDate;
								taskObj.executor = person;
								taskObj.comment = task.note.comment;
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
	partment['产品部'].forEach(function(person) {
		var personObj = analyze(person, obj);
		infos.push(personObj);
	});
	return sortTasks(infos);
}

module.exports = {
	searchPersonTasks: searchPersonTasks,
	performance: performance,
	getTaskList: getTaskList
};
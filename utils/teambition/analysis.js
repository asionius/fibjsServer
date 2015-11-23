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

var new_parseNote = function(note) {
	if (note && note.indexOf('v1.1002') !== -1) {

		function getParentTaskNote(note) {
			var pNote = [];
			pNote.push(note.month);
			pNote.push(note.pJ);
			pNote.push(note.score);
			pNote.push(note.pause);
			return pNote.join('\r\n');
		}

		function transFromPj(pJ) {
			if (/^p\d+\*\d*\.*\d+[hd]$/.test(pJ)) {
				var p = pJ.split('*')[0].split('p')[1],
					t = pJ.split('*')[1].split(/[hd]/)[0];
				if (pJ.indexOf('d') !== -1) t *= 8;
				return (1 << p - 1) * t;
			}
			return 0;
		}

		function convertToPj(sum) {
			return 'p1*' + sum + 'h';
		}

		var ret = {};
		note = JSON.parse(note);
		ret.parentNote = getParentTaskNote(note);
		if (note.subTasks.length === 0) return ret;
		else {
			var ax = 0;
			ret.subTaskNotes = [];
			note.subTasks.forEach(function(subTask) {
				var noteInfo = [],
					tname = subTask.name,
					executor = subTask.executor;
				noteInfo.push(subTask.month);
				noteInfo.push(subTask.pJ);
				ax += transFromPj(subTask.pJ);
				noteInfo.push(subTask.score);
				noteInfo.push(subTask.pause);
				ret.subTaskNotes.push({
					executor: executor,
					taskname: tname,
					note: noteInfo.join('\r\n')
				});
			});
			note.pJ = convertToPj(transFromPj(note.pJ) - ax);
			ret.parentNote = getParentTaskNote(note);
			return ret;
		}

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
						var task = tasks[i],
							note;
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
								note = new_parseNote(task.newnote);
								if (util.isObject(note)) task.newnote = note.parentNote;
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
						}
						//旧数据格式
						// if (task.note.set_note) {
						// 	var note = parseNote(task.note.set_note.note);
						// 	if (util.isObject(note) && note[person]) task.note.set_note.note = note[person];
						// 	else continue;
						// } else continue;
						// 子任务
						if (task.subTasks.length === 0) continue;
						task.subTasks.forEach(function(subTask) {
							if (subTask.executor && subTask.executor.name === person) {
								if (task.newnote) note = note ? note : new_parseNote(task.newnote);
								var taskname = subTask.content;
								var taskObj = {};
								taskObj.name = taskname;
								taskObj.dueDate = subTask.dueDate;
								taskObj.project = project;
								taskObj.projectid = task.projectid;
								taskObj.itemid = task.personid;
								taskObj.id = subTask._taskId;
								taskObj.stage = st;
								taskObj.isEnd = subTask.isDone;
								taskObj.priority = task.priority;
								taskObj.executor = person;
								taskObj.comment = '';
								if (!util.isObject(note)) {
									taskObj.note = '';
									result.tasks.push(taskObj);
									return;
								};
								note.subTaskNotes.forEach(function(subNote) {
									if (subNote.taskname === taskname && subNote.executor === person) {
										taskObj.note = subNote.note;
										result.tasks.push(taskObj);
									}
								})
							}
						});
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
							taskObj.subTasks = task.subTasks;
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
								taskObj.subTasks = task.subTasks;
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
		var personObj = searchPersonTasks(person, obj);
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
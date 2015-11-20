$(function() {
	var partment,
		time,
		res,
		priorityName = {
			0: '普通',
			1: '紧急',
			2: '非常紧急'
		},
		n = 0,
		satgestate = ['需求确认', '解决方案', '开发', '测试版', '预览版', '正式版'],
		P,
		house = false;

	function tojson(v) {
		var json;
		new Function("define", v)(function(val) {
			json = val;
		});
		return json;
	}

	var baozObject;
	Date.prototype.format = function(format) {
		var o = {
			"M+": this.getMonth() + 1, //month
			"d+": this.getDate(), //day
			"h+": this.getHours(), //hour
			"m+": this.getMinutes(), //minute
			"s+": this.getSeconds(), //second
			"q+": Math.floor((this.getMonth() + 3) / 3), //quarter
			"S": this.getMilliseconds() //millisecond
		}
		if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(format))
				format = format.replace(RegExp.$1,
					RegExp.$1.length == 1 ? o[k] :
					("00" + o[k]).substr(("" + o[k]).length));
		return format;
	}

	function getP() {
		$.ajax({
			type: "GET",
			url: "/teambition/P",
			async: false,
			timeout: 1000 * 60,
			dataType: "text",
			success: function(result) {
				P = tojson(result);
			},
			error: function(result) {
				console.error(result);
			}
		});
	}

	function getTime() {
		$.ajax({
			type: "GET",
			url: "/teambition/root",
			async: false,
			timeout: 1000 * 60,
			dataType: "text",
			success: function(result) {
				baozObject = tojson(result);
			},
			error: function(result) {
				console.error(result);
			}
		})
		partment = baozObject.partment;
		time = (new Date(baozObject.created)).toString();
		$('#time').text('数据更新于' + time + '');
		$('#time').append('<button id="refresh">更新数据</button>')
	}

	function refresh() {
		$.ajax({
			type: "GET",
			url: "/teambition/refresh",
			async: false,
			timeout: 1000 * 60,
			dataType: "text",
			success: function(result) {
				alert('服务器正在更新数据,请休息一会或喝杯咖啡,稍后为您呈现最新数据');
			},
			error: function(result) {
				console.error(result);
			}
		});
	}

	function checkDate() {
		var lines = $('table').find('tr'),
			len = lines.length;
		for (var i = 1; i < len; i++) {
			lines.eq(i).removeClass('warn');
			var j = Number(i) - 1;
			var due = $('#td' + j + '').find('td').eq(3).html();
			if (due) {
				if (new Date().getTime() - new Date(due).getTime() > 1000 * 60 * 60 * 24) lines.eq(i).addClass('warn');
			}
		}
	}

	function getTask() {
		$.ajax({
			type: "GET",
			url: "/teambition/list/技术部",
			async: false,
			timeout: 1000 * 60,
			dataType: "text",
			success: function(result) {
				res = tojson(result);
			},
			error: function(result) {
				console.error(result);
			}
		});
		fillTable();
	}

	function clickPriority() {
		var hurry = document.getElementById('hurry').checked ? $('#hurry').attr("value") : '',
			vhurry = document.getElementById('vhurry').checked ? $('#vhurry').attr("value") : '',
			normal = document.getElementById('normal').checked ? $('#normal').attr("value") : '',
			check = [];
		check.push(hurry);
		check.push(vhurry);
		check.push(normal);
		console.log(check)
		for (var task in res) {
			if (check.indexOf(priorityName[res[task].priority]) != -1) $('#td' + task + '').show();
			else $('#td' + task + '').hide();
		}
	}

	function clickStage() {
		var cq = document.getElementById('cq').checked ? $('#cq').attr("value") : '',
			sl = document.getElementById('sl').checked ? $('#sl').attr("value") : '',
			pd = document.getElementById('pd').checked ? $('#pd').attr("value") : '',
			tt = document.getElementById('tt').checked ? $('#tt').attr("value") : '',
			pv = document.getElementById('pv').checked ? $('#pv').attr("value") : '',
			rs = document.getElementById('rs').checked ? $('#rs').attr("value") : '',
			os = document.getElementById('os').checked ? $('#os').attr("value") : '',
			check = [];
		check.push(cq);
		check.push(sl);
		check.push(pd);
		check.push(tt);
		check.push(pv);
		check.push(rs);
		check.push(os);
		for (var task in res) {
			if (check.indexOf("其它阶段") != -1) $('#td' + task + '').show();
			else if (check.indexOf(res[task].stage) != -1) $('#td' + task + '').show();
			else $('#td' + task + '').hide();
		}
	}

	function clickDue() {
		var due = document.getElementById('due').checked;
		if (due) {
			for (var task in res) {
				if ($('#td' + task + '').find('td').eq(2).html()) $('#td' + task + '').show();
				else $('#td' + task + '').hide();
			}
		} else {
			for (var task in res) {
				$('#td' + task + '').show();
			}
		}
	}

	function setNote() {
		function checkInput(errorMsg, checkObj) {
			if (checkObj.month && !/\d+月/.test(checkObj.month)) errorMsg += '月份例如1月的样式\r\n';
			if (checkObj.score && !/\d+/.test(checkObj.score)) errorMsg += '得分纯数字\r\n';
			if (checkObj.pJ && !/^p\d+\*\d*\.*\d+[hd]$/.test(checkObj.pJ)) errorMsg += '评级是p级*[dh]如p3*3d\r\n';
			if (checkObj.pause && !/\d+[hd]/.test(checkObj.pause)) errorMsg += '暂停备注数字[hd]如4d\r\n';
			return errorMsg;
		}

		var index = Number($('#manager').val()) - 1,
			month = $('#mmonth').val(),
			taskid = res[index].id,
			pause = $('#mpause').val() == '无' ? '' : $('#mpause').val(),
			score = $('#mscore').val(),
			pJ = $('#mpj').val(),
			errorMessage = '';
		var data = {
				taskid: taskid,
			},
			postNote = {
				version: 'v1.1002', //第二版本的note, 第一版本为v1.1001
				month: month,
				pJ: pJ,
				score: score,
				pause: pause,
				subTasks: []
			};
		data.note = postNote;
		errorMessage = checkInput(errorMessage, postNote);
		var subDivs = $('#subtasks').find('div'),
			divLength = subDivs.length;
		for (var i = 0; i < divLength; i++) {
			var subMonth = subDivs.eq(i).find('#submonth').val(),
				subpJ = subDivs.eq(i).find('#subpJ').val(),
				subScore = subDivs.eq(i).find('#subscore').val(),
				subPause = subDivs.eq(i).find('#subpause').val(),
				name = subDivs.eq(i).find('#subtaskname').text(),
				executor = subDivs.eq(i).find('#subexecutor').text(),
				checkObj = {
					name: name,
					month: subMonth,
					pJ: subpJ,
					score: subScore,
					executor: executor,
					pause: subPause
				};
			errorMessage = checkInput(errorMessage, checkObj);
			data.note.subTasks.push(checkObj);
		};
		if (errorMessage) {
			alert(errorMessage);
			return;
		}
		$.ajax({
			type: "POST",
			url: "/setnote/",
			async: false,
			timeout: 1000 * 60,
			data: JSON.stringify(data),
			dataType: "text",
			success: function(result) {
				result = tojson(result);
				alert(result);
			},
			error: function(result) {
				alert('修改失败');
				console.error(result);
			}
		})
		$('#taskmanager').removeClass('activemanager');
		$('#taskmanager').addClass('taskmanager');
	}

	function getPartment(person) {
		if (partment['技术部'].indexOf(person)) {
			return 't';
		}
		if (partment['产品部'].indexOf(person)) {
			return 'p';
		}
	}

	function manager() {
		var index = Number($('#manager').val()) - 1,
			task = res[index],
			snote = task.note ? task.note : '',
			month;
		//兼容新旧数据
		if (snote && snote.indexOf('v1.1002') != -1) {
			var note = JSON.parse(snote);
			month = note.month;
			$('#mpause').val(note.pause ? note.pause : '无');
			$('#mscore').val(note.score ? note.score : '');
			$('#mpj').val(note.pJ ? note.pJ : '');
		} else if (snote) {
			var note = snote.split('\r\n');
			if (!/\d+月/.test(note[0])) month = '';
			else month = note[0];
			var pJ = note[1];
			if (/^p\d+\*\d*\.*\d+[hd]$/.test(pJ) === false) pJ = '未评定';
			var score = note[2];
			if (!/\d+/.test(score)) score = '';
			var pause = note[3];
			if (!/^\d+[hd]$/.test(pause)) pause = '无';
			$('#mpause').val(pause);
			$('#mpj').val(pJ);
			$('#mscore').val(score);
		} else {
			$('#mmonth').val('');
			$('#mpj').val('');
			$('#mscore').val('');
			$('#mpause').val('无');
		}
		$('#taskname').html(task.name);
		$('#mmonth').val(month);
		var stsks = parseSubTasks(task.subTasks, snote);
		while (stsks.length > 0) {
			var order = stsks.shift().split('.')[0],
				name = stsks.shift(),
				executor = stsks.shift(),
				subMonth = stsks.shift(),
				subpJ = stsks.shift(),
				subScore = stsks.shift(),
				subPause = stsks.shift(),
				subDueDate = stsks.shift();
			$('#subtasks').append('<div id="subtask' + order + '" class="subtasks"> <p class = "subtitle"> 子任务 <span id="subtaskindex">' + order + ' </span><span id="subtaskname">' + name + '</span><span>' + subDueDate + '</span><span id="subexecutor" style="float:right;">' + executor + '</span></p> <p class = "submonth"> 月份<input type = "text" id="submonth" value= "' + subMonth + '" style="width: 50px;" /></p> <p class = "subpJ"> p级<input type = "text" id = "subpJ" value="' + subpJ + '"style = "width: 50px;" /> </p> <p class="subscore"> 评分<input type = "text" id="subscore" value="' + subScore + '" style="width: 50px;" /> </p> <p class = "subpause"> 暂停<input type="text" id="subpause" value="' + subPause + '" style="width: 50px;" /> </p> </div>');
		}

	}

	function premanager() {
		$('#manager').empty();
		$('#subtasks').empty();
		$('#taskname').empty();
		$('#month').val('');
		$('#mpause').val('无');
		$('#mscore').val('');
		var length = res.length;
		for (var i = 0; i < length; i++) {
			var j = Number(i) + 1;
			$('#manager').append('<option>' + j + '</option>');
		}
		$('#taskmanager').removeClass('activemanager');
		$('#taskmanager').addClass('taskmanager');
	}

	//干系人, 该需求已经变更
	function parseRelation(snote) {
		var relation = '';
		if (snote && snote.indexOf('v1.1001') != -1) {
			var note = JSON.parse(snote);

			relation = '产品: ' + note.prod.person.name + ' ' + note.prod.person.P + ' ' + note.prod.person.time + ' 技术: ' + note.tech.person.name + ' ' + note.tech.person.P + ' ' + note.tech.person.time;
		} else relation = '未设置干系人';
		return relation;
	}

	function parseSubTasks(subTasks, snote) {
		if (!subTasks.length) return [];
		var subTs = [];
		subTasks.forEach(function(subTask) {
			subTs.push(subTask.order + '.');
			subTs.push(subTask.content);
			subTs.push(subTask.executor ? subTask.executor.name : '');
			var pJ = '',
				month = '',
				pause = '',
				score = '';
			if (snote && snote.indexOf('v1.1002') != -1) {
				var note = JSON.parse(snote);
				note.subTasks.forEach(function(sTask) {
					if (sTask.name == subTask.content) {
						pJ = sTask.pJ;
						month = sTask.month;
						pause = sTask.pause;
						score = sTask.score;
					}
				});
			}
			subTs.push(month);
			subTs.push(pJ);
			subTs.push(score);
			subTs.push(pause);
			subTs.push(subTask.dueDate ? subTask.dueDate : '');
		});
		return subTs;
	}

	function clickPJ() {
		var id = $(this).context.id;
		var taskIndex = Number(id.split('subtasks')[1]);
		$('#manager').val(taskIndex + 1);
		$('#taskmanager').removeClass('taskmanager');
		$('#taskmanager').addClass('activemanager');
		manager();
	}

	function showLastComment() {
		alert($(this).html());
	}

	function fillTable() {
		$('#table').empty();
		$('#table').append('<tr id="thead"style="color:blue;"><td class="index">编号</td><td><input type="checkbox" value="紧急" id="hurry">紧急任务<input type="checkbox" value="非常紧急" id="vhurry">非常紧急<input type="checkbox" value="普通" id="normal">普通任务</td><td class="due"><input type="checkbox" value="截止日期" id="due">截止日期</td><td class="executor">负责人</td><td class="project">所属项目</td><td class="pause">暂停备注</td><td class="confirmquestion" value="需求确认" title="需求确认"><input type="checkbox" value="需求确认" id="cq">需求</td><td class="solution" value="解决方案" title="解决方案"><input type="checkbox" value="解决方案" id="sl">解决案</td><td class="product" value="开发"><input type="checkbox" value="开发" id="pd">开发</td><td class="test" value="测试版"><input type="checkbox" value="测试版" id="tt">测试版</td><td class="preview" value="预览版"><input type="checkbox" value="预览版" id="pv">预览版</td><td class="result" value="正式版"><input type="checkbox" value="正式版" id="rs">正式版</td><td class="stage" value="其它阶段"><input type="checkbox" value="其它阶段" id="os">所有阶段</td><td class="lastcomment">最后评论</td><td class="subtasks">子任务</td></tr>');

		for (var task in res) {
			if (house) {
				$('#table').append("<tr id='td" + task + "' style='background-color: #d5d5d5;'></tr>");
			} else {
				$('#table').append("<tr id='td" + task + "' ></tr>");
			}
			house = !house;
			var index = Number(task) + 1;
			var priority = priorityName[res[task].priority];
			$('#td' + task + '').append("<td class='index'>" + index + "</td>");
			// $('#td' + task + '').append("<td class='priority'>" + priority + "</td>");
			$('#td' + task + '').append("<td class='taskname' title='" + res[task].name + "'><a href='https://www.teambition.com/project/" + res[task].projectid + "/tasks/scrum/" + res[task].itemid + "/task/" + res[task].id + "' target='_blank'> <span>" + '<b>[' + priority + '] </b></span>' + res[task].name + "</a></td>");

			var set_note = res[task].note;
			var note = set_note ? set_note.split('\r\n') : '';
			var month = note ? (note[0] ? note[0] : '未知') : '未知';
			if (!/\d+月/.test(month)) month = '未知';
			var pJ = note ? (note[1] ? note[1] : '未平定') : '未平定';
			if (/^p\d+\*\d*\.*\d+[hd]$/.test(pJ) === false) pJ = '未平定';
			var pause = note ? (note[2] ? note[2] : '无') : '无';
			if (!/^\d+[hd]$/.test(pause)) pause = '无';

			// $('#td' + task + '').append("<td>" + pJ + "</td>");

			var dueDate = res[task].dueDate;
			dueDate = dueDate ? new Date(dueDate).format('yyyy-MM-dd') : '';
			$('#td' + task + '').append("<td title=" + dueDate + ">" + dueDate + "</td>");
			$('#td' + task + '').append("<td class='executor'>" + res[task].executor + "</td>");
			$('#td' + task + '').append("<td class='project' title=" + res[task].project + ">" + res[task].project + "</td>");
			$('#td' + task + '').append("<td id='pause" + task + "'></td>");
			$('#pause' + task + '').text(pause);
			var confirmquestion = ('需求确认' == res[task].stage) ? '√' : '',
				solution = ('解决方案' == res[task].stage) ? '√' : '',
				product = ('开发' == res[task].stage) ? '√' : '',
				test = ('测试版' == res[task].stage) ? '√' : '',
				preview = ('预览版' == res[task].stage) ? '√' : '',
				result = ('正式版' == res[task].stage) ? '√' : '';
			$('#td' + task + '').append("<td class='confirmquestion'>" + confirmquestion + "</td>");
			$('#td' + task + '').append("<td class='solution'>" + solution + "</td>");
			$('#td' + task + '').append("<td class='product'>" + product + "</td>");
			$('#td' + task + '').append("<td class='test'>" + test + "</td>");
			$('#td' + task + '').append("<td class='preview'>" + preview + "</td>");
			$('#td' + task + '').append("<td class='result'>" + result + "</td>");
			$('#td' + task + '').append("<td class='stage'>" + res[task].stage + "</td>");
			var comment = res[task].comment ? res[task].comment.content : '',
				commentCreated = res[task].comment ? new Date(res[task].comment.created).format('yyyy-MM-dd hh:mm:ss') : '',
				who = res[task].comment ? res[task].comment.creator : '';
			lastComment = comment ? who + ' :' + comment + ' 时间: ' + commentCreated : '';
			$('#td' + task + '').append("<td class='lastcomment' title='" + lastComment + "'>" + lastComment + "</td>");
			var subtasks = parseSubTasks(res[task].subTasks, set_note).join(' ');
			$('#td' + task + '').append("<td class='subtasks' title='" + subtasks + "'><span style='display:inline-block; float: left; width: 200px;'>" + subtasks + "</span><span style='display:inline-block; float: right;'><button id='subtasks" + task + "'style='padding-top: 1px; padding-bottom:1px; float: right;'>评级</button></span></td>");
		}
		premanager();
	}

	getP();
	getTime();
	getTask();
	$('#refresh').click(refresh);
	$('.lastcomment').dblclick(showLastComment);
	$('#manager').change(manager);
	$('td button').click(clickPJ);
	$('#hurry').click(clickPriority);
	$('#vhurry').click(clickPriority);
	$('#normal').click(clickPriority);
	$('#cq').click(clickStage);
	$('#sl').click(clickStage);
	$('#pd').click(clickStage);
	$('#tt').click(clickStage);
	$('#pv').click(clickStage);
	$('#rs').click(clickStage);
	$('#os').click(clickStage);
	$('#due').click(clickDue);
	$('#submit').click(setNote);
	$('#cancel').click(premanager);
	setInterval(getTask, 1000 * 60 * 100);
	setInterval(getTime, 1000 * 60 * 60);
});
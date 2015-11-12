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
	// var servers=[{"name": "s16", "ip": "120.55.75.27:9001"}];
	var servers = [{
		"name": "s16",
		// "ip": "192.168.1.64"
		"ip": "127.0.0.1"
	}];

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
			url: "http://" + servers[0]["ip"] + "/teambition/P",
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
			url: "http://" + servers[0]["ip"] + "/teambition/root",
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
			url: "http://" + servers[0]["ip"] + "/teambition/refresh",
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
			url: "http://" + servers[0]["ip"] + "/teambition/list/技术部",
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
				if ($('#td' + task + '').find('td').eq(3).html()) $('#td' + task + '').show();
				else $('#td' + task + '').hide();
			}
		} else {
			for (var task in res) {
				$('#td' + task + '').show();
			}
		}
	}

	function setNote() {
		var index = Number($('#manager').val()) - 1,
			pname = $('#product').val() == '请选择' ? '' : $('#product').val(),
			pP = $('#pP').val(),
			pday = $('#pday').val(),
			tname = $('#technology').val() == '请选择' ? '' : $('#technology').val(),
			tP = $('#tP').val(),
			tday = $('#tday').val(),
			month = $('#month').val(),
			taskid = res[index].id,
			pause = $('#mpause').val() == '无' ? '' : $('#mpause').val(),
			score = $('#mscore').val();
		if (!/^\d+$/.test(score)) score = 0;
		var data = {
			taskid: taskid,
			note: {
				version: 'v1.1001',
				month: month,
				pause: pause,
				score: score,
				prod: {
					person: {
						name: pname,
						P: pP,
						time: pday
					}
				},
				tech: {
					person: {
						name: tname,
						P: tP,
						time: tday
					}
				}
			}
		};
		$.ajax({
			type: "POST",
			url: "http://" + servers[0]["ip"] + "/setnote/",
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
			snote = task.comment.set_note ? task.comment.set_note.note : '',
			executor = task.executor,
			month;
		//兼容新旧数据
		if (snote && snote.indexOf('v1.1001') != -1) {
			var note = JSON.parse(snote);
			month = note.month;
			$('#mpause').val(note.pause ? note.pause : '无');
			$('#mscore').val(note.score ? note.pause : '');
			if (note.prod.person.name) {
				document.getElementById(note.prod.person.name).selected = true;
				$('#pP').val(note.prod.person.P);
				$('#pday').val(note.prod.person.time);
			}
			if (note.tech.person.name) {
				document.getElementById(note.tech.person.name).selected = true;
				$('#tP').val(note.tech.person.P);
				$('#tday').val(note.tech.person.time);
			}
		} else if (snote) {
			var note = snote.split('\r\n');
			if (!/\d+月/.test(note[0])) month = '未知';
			else month = note[0];
			var pJ = note ? (note[1] ? note[1] : '未平定') : '未平定';
			if (/^p\d+\*\d*\.*\d+[hd]$/.test(pJ) === false) pJ = '未平定';
			else {
				var part = getPartment(executor);
				$('#' + part + 'P').val(pJ.split('*')[0]);
				$('#' + part + 'day').val(pJ.split('*')[1]);
			}
			var pause = note ? (note[2] ? note[2] : '无') : '无';
			if (!/^\d+[hd]$/.test(pause)) pause = '无';
			$('#mpause').val(pause);
		} else {
			$('#pP').val('');
			$('#pday').val('');
			$('#tP').val('');
			$('#tday').val('');
			$('#mpause').val('无');
		}

		document.getElementById(executor).selected = true;
		$('#month').val(month);

	}

	function premanager() {
		$('#manager').empty();
		$('#product').empty();
		$('#technology').empty();
		$('#product').append('<option>请选择</option>');
		$('#technology').append('<option>请选择</option>');
		$('#manager').append('<option>请选择编号</option>');
		var length = res.length;
		for (var i = 0; i < length; i++) {
			var j = Number(i) + 1;
			$('#manager').append('<option>' + j + '</option>');
		}
		for (var i in partment['产品部']) {
			$('#product').append('<option id="' + partment['产品部'][i] + '" >' + partment['产品部'][i] + '</option>');

		}
		for (var i in partment['技术部']) {
			$('#technology').append('<option id="' + partment['技术部'][i] + '">' + partment['技术部'][i] + '</option>');
		}

	}

	function parseRelation(set_note) {
		var snote = set_note ? set_note.note : '',
			relation = '';
		if (snote && snote.indexOf('v1.1001') != -1) {
			var note = JSON.parse(snote);

			relation = '产品: ' + note.prod.person.name + ' ' + note.prod.person.P + ' ' + note.prod.person.time + ' 技术: ' + note.tech.person.name + ' ' + note.tech.person.P + ' ' + note.tech.person.time;
		} else relation = '未设置干系人';
		return relation;
	}

	function fillTable() {
		$('#table').empty();
		$('#table').append('<tr id="thead"style="color:blue;"><td class="index">编号</td><td><input type="checkbox" value="紧急" id="hurry">紧急任务<input type="checkbox" value="非常紧急" id="vhurry">非常紧急<input type="checkbox" value="普通" id="normal">普通任务</td><td class="p" title="p级*工期">p级*工期</td><td class="due"><input type="checkbox" value="截止日期" id="due">截止日期</td><td class="executor">执行人</td><td class="project">所属项目</td><td class="pause">暂停备注</td><td class="confirmquestion" value="需求确认" title="需求确认"><input type="checkbox" value="需求确认" id="cq">需求</td><td class="solution" value="解决方案" title="解决方案"><input type="checkbox" value="解决方案" id="sl">解决案</td><td class="product" value="开发"><input type="checkbox" value="开发" id="pd">开发</td><td class="test" value="测试版"><input type="checkbox" value="测试版" id="tt">测试版</td><td class="preview" value="预览版"><input type="checkbox" value="预览版" id="pv">预览版</td><td class="result" value="正式版"><input type="checkbox" value="正式版" id="rs">正式版</td><td class="stage" value="其它阶段"><input type="checkbox" value="其它阶段" id="os">所有阶段</td><td class="relation">干系人</td></tr>');

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

			var set_note = res[task].comment.set_note;
			var note = set_note ? (set_note.note ? set_note.note.split('\r\n') : '') : '';
			var month = note ? (note[0] ? note[0] : '未知') : '未知';
			if (!/\d+月/.test(month)) month = '未知';
			var pJ = note ? (note[1] ? note[1] : '未平定') : '未平定';
			if (/^p\d+\*\d*\.*\d+[hd]$/.test(pJ) === false) pJ = '未平定';
			var pause = note ? (note[2] ? note[2] : '无') : '无';
			if (!/^\d+[hd]$/.test(pause)) pause = '无';

			$('#td' + task + '').append("<td>" + pJ + "</td>");

			var set_duedate = res[task].comment.set_duedate;
			var dueDate = set_duedate ? set_duedate.dueDate : '';
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
			var relation = parseRelation(res[task].comment.set_note);
			$('#td' + task + '').append("<td class='relation' title='" + relation + "'>" + relation + "</td>");
		}
		premanager();
	}
	getP();
	getTime();
	getTask();
	$('#refresh').click(refresh);
	$('#manager').change(manager);
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
	setInterval(getTask, 1000 * 60 * 100);
	setInterval(getTime, 1000 * 60 * 60);
});
"use strict";

var http = require('http');
var encoding = require("encoding");
var coroutine = require('coroutine');
var ssl = require("ssl");

function client() {
	var header = {
		'accept': "application/json, text/javascript, */*, charset=utf-8;",
		'accept-language': "accept-language:zh-CN,zh;",
		// "cookie": "_ga=GA1.2.1826347174.1444904382; ajs_anonymous_id=%224d4f4f38-feda-4211-a4a7-ad0299e17d59%22; TEAMBITION_SESSIONID=eyJ1aWQiOiI1NjIwN2Y2MDA0MmExMjI5MThlMWM3ZWQiLCJ1c2VyIjp7ImF2YXRhclVybCI6Imh0dHBzOi8vc3RyaWtlci50ZWFtYml0aW9uLm5ldC90aHVtYm5haWwvMTEwOThmYmY5ZDBhY2MzMGU1ZGYyZjg3MWZlY2ExYzhhZGVkL3cvMTAwL2gvMTAwIiwibmFtZSI6Ik5BTUUiLCJlbWFpbCI6InRlYW1iaXRpb25AYmFvei5jbiIsIl9pZCI6IjU2MjA3ZjYwMDQyYTEyMjkxOGUxYzdlZCIsImlzTmV3IjpmYWxzZX0sInRzIjoxNDQ1MDA5NTc2NTQwfQ==; TEAMBITION_SESSIONID.sig=Oa8HL3ef3g_WyZn_Ey1eh4vYf98; lang=zh; Hm_lvt_ec912ecc405ccd050e4cdf452ef4e85a=1444904379,1444966177,1445007863,1445179099; Hm_lpvt_ec912ecc405ccd050e4cdf452ef4e85a=1445179099; ajs_group_id=null; ajs_user_id=%2256207f60042a122918e1c7ed%22; _pk_ref.1.c96e=%5B%22%22%2C%22%22%2C1445179103%2C%22https%3A%2F%2Faccount.teambition.com%2Flogin%3Fnext_url%3Dhttps%3A%2F%2Fwww.teambition.com%2Fprojects%22%5D; _cioid=56207f60042a122918e1c7ed; _cio=1105cb0e-18b2-8059-8309-e72dc762b7b5; _pk_id.1.c96e=b3791325907871a3.1444904391.5.1445179256.1445179103.; _pk_ses.1.c96e=*"
		"cookie": "_ga=GA1.2.1826347174.1444904382; lang=zh; _pk_ref.1.c96e=%5B%22%22%2C%22%22%2C1445475860%2C%22https%3A%2F%2Faccount.teambition.com%2Flogin%3Fnext_url%3Dhttps%3A%2F%2Fwww.teambition.com%2Fprojects%22%5D; TEAMBITION_SESSIONID=eyJ1aWQiOiI1NjIwN2Y2MDA0MmExMjI5MThlMWM3ZWQiLCJ1c2VyIjp7ImF2YXRhclVybCI6Imh0dHBzOi8vc3RyaWtlci50ZWFtYml0aW9uLm5ldC90aHVtYm5haWwvMTEwOThmYmY5ZDBhY2MzMGU1ZGYyZjg3MWZlY2ExYzhhZGVkL3cvMTAwL2gvMTAwIiwibmFtZSI6Ik5BTUUiLCJlbWFpbCI6InRlYW1iaXRpb25AYmFvei5jbiIsIl9pZCI6IjU2MjA3ZjYwMDQyYTEyMjkxOGUxYzdlZCIsImlzTmV3IjpmYWxzZX0sInRzIjoxNDQ1NDc2MjA1NzY0fQ==; TEAMBITION_SESSIONID.sig=IaGD7Mqli3MZfr1_Tw7m_XKs3UE; ajs_anonymous_id=%22785d2f9c-f287-4f7d-a008-e5afe77a708c%22; _cio=54d32d36-488a-f3bc-36bc-2fd621030e73; _cioid=56207f60042a122918e1c7ed; Hm_lvt_ec912ecc405ccd050e4cdf452ef4e85a=1445216770,1445303297,1445391704,1445475860; Hm_lpvt_ec912ecc405ccd050e4cdf452ef4e85a=1445481993; ajs_group_id=null; ajs_user_id=%2256207f60042a122918e1c7ed%22; _pk_id.1.c96e=b3791325907871a3.1444904391.17.1445482008.1445475860.; _pk_ses.1.c96e=*"
	}

	// "_gat=1; TEAMBITION_SESSIONID=eyJ1aWQiOiI1NTkzNDdkZWU2ZWIyNTA1MzBjMDU2YzMiLCJ1c2VyIjp7ImF2YXRhclVybCI6Imh0dHBzOi8vbWFpbGltZy50ZWFtYml0aW9uLmNvbS9sb2dvcy80LnBuZyIsIm5hbWUiOiJhc2lvbml1cyIsImVtYWlsIjoiYWlrZS53YW5nQGJhb3ouY24iLCJfaWQiOiI1NTkzNDdkZWU2ZWIyNTA1MzBjMDU2YzMiLCJpc05ldyI6ZmFsc2V9LCJ0cyI6MTQ0NDg3NzgxNTIxMX0=; TEAMBITION_SESSIONID.sig=HzMvRFzHDRfPBFD-05IA81N4NBE; lang=zh; _pk_ref.1.c96e=%5B%22%22%2C%22%22%2C1444877816%2C%22https%3A%2F%2Faccount.teambition.com%2Flogin%3Fnext_url%3Dhttps%3A%2F%2Fwww.teambition.com%2Fprojects%22%5D; ajs_anonymous_id=%225392210d-e31c-4530-8502-8f31bd3ef823%22; _cioid=559347dee6eb250530c056c3; _cio=9e47aaa5-9c71-4d80-780a-659efeeaa080; _pk_id.1.c96e=e39aeea90e942c44.1444877816.1.1444878256.1444877816.; _pk_ses.1.c96e=*; Hm_lvt_ec912ecc405ccd050e4cdf452ef4e85a=1444877796; Hm_lpvt_ec912ecc405ccd050e4cdf452ef4e85a=1444878256; ajs_group_id=null; _ga=GA1.2.1378422859.1444877797; ajs_user_id=%22559347dee6eb250530c056c3%22"

	ssl.ca.loadRootCerts();

	this.getOrganizations = function(orgId) {
		var sTime = (new Date()).getTime().toString();
		var params = {
			k: 'GET',
			url: "https://www.teambition.com/api/organizations?_=" + sTime
		}
		var r = http.get(params.url, header);
		return r.body.readAll().toString();
	}

	this.getTeamMembers = function(orgId) {
		var sTime = (new Date()).getTime().toString();
		var params = {
			k: 'GET',
			url: "https://www.teambition.com/api/teams?_organizationId=" + orgId + "&_=" + sTime
		}
		var r = http.get(params.url, header);
		return r.body.readAll().toString();
	}

	this.getProjectInfo = function() {
		var sTime = (new Date()).getTime().toString();
		var params = {
			k: 'GET',
			url: "https://www.teambition.com/api/projects?_=" + sTime
		}
		var r = http.get(params.url, header);
		return r.body.readAll().toString();
	}

	//项目里面的任务分类
	this.getPersonInfo = function(projectId) {
		var sTime = (new Date()).getTime().toString();
		var params = {
			k: 'GET',
			url: "https://www.teambition.com/api/tasklists?_projectId=" + projectId + "&_=" + sTime
		};
		var r = http.get(params.url, header);
		return r.body.readAll().toString();
	}

	//分类任务里面的任务阶段
	this.getPersonalTaskList = function(taskListId) {
		var sTime = (new Date()).getTime().toString();
		var params = {
			k: 'GET',
			url: "https://www.teambition.com/api/stages?_tasklistId=" + taskListId + "&_=" + sTime
		};
		var r = http.get(params.url, header);
		return r.body.readAll().toString();
	}

	//任务阶段里面的任务
	this.getTasks = function(tasksId, isDone) {
		var sTime = (new Date()).getTime().toString();
		isDone = isDone ? "true" : "false";

		var params = {
			k: 'GET',
			url: "https://www.teambition.com/api/stages/" + tasksId + "/tasks?isDone=" + isDone + "&count=20&page=1&_stageId=" + tasksId + "&_=" + sTime
		};
		var r = http.get(params.url, header);
		return r.body.readAll().toString();
	}

	//获取任务里面的详细信息
	this.getNoteByTaskId = function(taskId) {
		var sTime = (new Date()).getTime().toString();

		var params = {
			k: 'GET',
			url: "https://www.teambition.com/api/activities?boundToObjectType=task&_boundToObjectId=" + taskId + "&_taskId=" + taskId + "&_=" + sTime
		};
		var r = http.get(params.url, header);
		var addInfo = JSON.parse(r.body.readAll().toString()),
			taskDetail = {};
		for (var i = addInfo.length - 1; i >= 0; i--) {
			taskDetail[addInfo[i].action] = taskDetail[addInfo[i].action] ? taskDetail[addInfo[i].action] : {};
			// taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
			switch (addInfo[i].action) {
				case "set_priority":
					if (taskDetail[addInfo[i].action].created) {
						if (new Date(addInfo[i].created) > new Date(taskDetail[addInfo[i].action].created)) {
							taskDetail[addInfo[i].action].priority = addInfo[i].priority;
							taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
							taskDetail[addInfo[i].action].created = addInfo[i].created;
						}
					} else {
						taskDetail[addInfo[i].action].priority = addInfo[i].priority;
						taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
						taskDetail[addInfo[i].action].created = addInfo[i].created;
					}
					break;
				case "set_done":
					if (taskDetail[addInfo[i].action].created) {
						if (new Date(addInfo[i].created) > new Date(taskDetail[addInfo[i].action].created)) {
							taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
							taskDetail[addInfo[i].action].created = addInfo[i].created;
						}
					} else {
						taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
						taskDetail[addInfo[i].action].created = addInfo[i].created;
					}
					break;
				case "set_note":
					if (taskDetail[addInfo[i].action].created) {
						if (new Date(addInfo[i].created) > new Date(taskDetail[addInfo[i].action].created)) {
							taskDetail[addInfo[i].action].note = addInfo[i].note;
							taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
							taskDetail[addInfo[i].action].created = addInfo[i].created;
						}
					} else {
						taskDetail[addInfo[i].action].note = addInfo[i].note;
						taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
						taskDetail[addInfo[i].action].created = addInfo[i].created;
					}
					break;
				case "set_duedate":
					if (taskDetail[addInfo[i].action].created) {
						if (new Date(addInfo[i].created) > new Date(taskDetail[addInfo[i].action].created)) {
							taskDetail[addInfo[i].action].dueDate = addInfo[i].dueDate;
							taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
							taskDetail[addInfo[i].action].created = addInfo[i].created;
						}
					} else {
						taskDetail[addInfo[i].action].dueDate = addInfo[i].dueDate;
						taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
						taskDetail[addInfo[i].action].created = addInfo[i].created;
					}
					break;
				case "set_content":
					taskDetail[addInfo[i].action].conntent = addInfo[i].conntent;
					taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
					break;
				case "set_stage":
					taskDetail[addInfo[i].action].set_stage = addInfo[i].title;
					taskDetail[addInfo[i].action].creator = addInfo[i].creator.name;
					break;
				default:
					break;

			}
		}
		console.log('taskDetail');
		return taskDetail;
	}
}

module.exports = function() {
	return new client();
}
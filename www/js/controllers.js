function tojson(v) {
	var json;
	new Function("define", v)(function(val) {
		json = val;
	});
	return json;
}

var exceptKpi = ['李操', '吴安', '衣不如新', '响马', '青蛙', '杜婷婷'];

app.controller('MainCtrl', function($scope, $http) {
	this.projectBoldName = 'NAME';
	this.projectName = '--teambetion';
	this.userName = 'Example user';
	this.headerText = '那么团队任务考核系统';
	this.descriptionText = 'Here you can quickly bootstrap your AngularJS project.';
}).controller('task', function($scope, $http) {
	$http.get('/teambition/root').success(function(data) {
		console.log(tojson(data).partment)
		$scope.partment = tojson(data).partment;
		$scope.lastUpdate = new Date(tojson(data).created).toString();
	});

	$scope.change = function() {
		var url = '/teambition/search/' + $scope.name;
		// var url = '/teambition/search/' + '沈志敏';
		console.log(url);
		$http.get(url).success(function(data) {
			console.log(tojson(data))
			$scope.taskman = tojson(data);
		});
	}
	$scope.trans = function(txt) {
		if (txt) {
			return txt.split('\r\n');
		} else {
			return [];
		}

	}
	$scope.change();
}).controller('kpi', function($scope, $http) {
	$http.get('/teambition/root').success(function(data) {
		console.log(tojson(data).partment)
		$scope.partment = tojson(data).partment;
		$scope.lastUpdate = new Date(tojson(data).created).toString();
	});
	$scope.showKpi = function() {
		console.log($scope.depart)
		console.log($scope.kpiDate);
		var url = 'teambition/performance/' + $scope.depart;
		$http.get(url).success(function(data) {
			console.log(tojson(data))
			$scope.kpiList = tojson(data);
			$scope.kpiInfo = $scope.kpiList.infos;
			$scope.kpiDetail = [];
			$scope.kpiInfo.forEach(function(personObj) {
				if (exceptKpi.indexOf(personObj.person) !== -1) return;
				var pf = 0;
				for (var task in personObj['tasks']) {
					if (personObj['tasks'][task].isEnd) {
						var set_note = personObj['tasks'][task].note;
						var note = set_note ? set_note.split('\r\n') : '';
						var month = note ? (note[0] ? note[0] : 0) : 0;
						var pJ = note ? (note[1] ? note[1] : 0) : 0;
						var score = note ? (note[2] ? note[2] : 0) : 0;
						var pause = note ? (note[3] ? note[3] : 0) : 0;
					} else continue;
					if (month && pJ && score) {
						if (/\d+月/.test(month) === false) {
							continue;
						}
						if (new Date().getMonth() + 1 !== Number(month.split('月')[0])) {
							continue;
						}
						if (/^p\d+\*\d*\.*\d+[hd]$/.test(pJ) === false) {
							// alert(personObj.person + ' : 备忘中任务p级和日期写在第二行，格式为pn*m[d|h] 其中n、m代表整数数字, d代表天,h代表小时, 不许出现小数');
							continue;
						}
						var ppd = pJ.split('*');
						var tpj = Number(ppd[0].split('p')[1]);
						var wds = ppd[1];
						// console.error(wds);
						if (!wds) continue;
						if (wds.indexOf('h') !== -1) {
							var a = wds.split('h')[0];

							wds = Number(wds.split('h')[0]) / 8;
						} else if (wds.indexOf('d') !== -1) {
							var a = wds.split('d')[0];
							wds = Number(a);
						} else {
							wds = Number(wds);
						}
						var pj = $scope.kpiList.P[personObj.person].P;
						if (!pj) {
							// alert(personObj.person + ' : 备忘中月份顶行写， 示例：10月, 并完善员工p级信息');
							continue;
						}
						score = Number(score);
						pf += score * wds * Math.pow(2, tpj - pj)
					} else {
						continue;
					}
				}
				if ($scope.kpiList.P[personObj.person]) {
					pf = pf / ($scope.kpiDate - $scope.kpiList.P[personObj.person].holiday);
					pf = Number(pf.toFixed(2));
					$scope.kpiDetail.push({
						name: $scope.kpiList.P[personObj.person].name,
						kpi: pf
					})
				}
			});
			$scope.kpiDetail.sort(function(a, b) {
				return a.kpi > b.kpi ? -1 : 1;
			})
			console.log($scope.kpiDetail)
		});
	}

	$scope.showLeaveWorkdays = function() {
		var time = new Date();

		function getLastDays(time) {
			var month = time.getMonth();
			var i = 1;
			for (;; i++) {
				if (month != new Date(time.getTime() + i * 1000 * 60 * 60 * 24).getMonth()) {
					return i;
				}
			}
		}

		function getWorkdays(time) {
			var days = getLastDays(time);
			var workdays = 0;
			for (var i = 0; i < days; i++) {
				if (new Date(time.getTime() + i * 1000 * 3600 * 24).getDay() < 6 && new Date(time.getTime() + i * 1000 * 3600 * 24).getDay() > 0) {
					console.log
					workdays++;
				}
			}
			return workdays;
		}
		var workdays = getWorkdays(time);
		return workdays;
	}
});
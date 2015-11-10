// var partment = {
// 	"产品部": ["杜婷婷", "季伟", "倪爽", "秦书影", "取小之", "石梦雨", "唐雷", "谭学潮", "汪嘉旻", "赵斌"],
// 	"技术部": ["响马", "asionius", "beaver", "杜婷婷", "房星星", "韩聪聪", "李操", "李文杰", "龙腾跃", "陆恒", "NanjingTony", "且听风殇", "青蛙", "沈志敏", "孙付荣", "孙培奇", "王慕天", "魏显龙", "我是小恩", "吴大维", "衣不如新", "喻培烽", "庄梦秋"],
// 	"运营部": ["响马", "杜婷婷", "黄晓丹", "刘艳芬", "卢丹", "千城墨白", "邵德云", "霜", "孙聪", "孙睿", "小美", "小美妹", "徐荣"],
// 	"人事_财务_法务": ["响马", "汤学梅", "叶玲"],
// 	"行政": ["蔡月", "杜婷婷"]
// };
var partment = {};
var client = require("./teamBitionClient.js")();

var orgs = JSON.parse(client.getOrganizations());
var teams = JSON.parse(client.getTeamMembers(orgs[0]._id));

teams.forEach(function(team) {
	partment[team.name] = [];
	team.hasMembers.forEach(function(member) {
		partment[team.name].push(member.name);
	})
})
module.exports = partment;
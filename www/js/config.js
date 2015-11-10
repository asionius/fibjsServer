function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/index");
    $stateProvider
        .state('index', {
            url: "/",
            templateUrl: "views/index.html",
            data: { pageTitle: 'index' }
        })
        .state('task', {
            url: "/task",
            templateUrl: "views/task.html",
            controller:'task',
            data: { pageTitle: '任务' }
        })
        .state('kpi', {
            url: "/kpi",
            templateUrl: "views/kpi.html",
            controller:'kpi',
            data: { pageTitle: '绩效' }
        })
}
angular
    .module('neuboard')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });

angular.module('total-accounts', ['blimpKit', 'platformView']).controller('totalAccountsController', ($scope, $http) => {
    const Shell = new ShellHub();

    $scope.openPerspective = () => {
        if (viewData && viewData.perspectiveId) Shell.showPerspective({ id: viewData.perspectiveId });
    };

    $http.get('/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/Accounts/AccountService.ts/count')
        .then((response) => {
            $scope.$evalAsync(() => {
                $scope.totalAccounts = response.data.count;
            });
        }, (error) => {
            $scope.totalAccounts = 'n/a';
            console.error(error);
        }
        );
});
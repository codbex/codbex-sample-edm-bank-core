angular.module('total-customers', ['blimpKit', 'platformView']).controller('totalCustomersController', ($scope, $http) => {
    const Shell = new ShellHub();

    $scope.openPerspective = () => {
        if (viewData && viewData.perspectiveId) Shell.showPerspective({ id: viewData.perspectiveId });
    };

    $http.get('/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/Customers/CustomerService.ts/count')
        .then((response) => {
            $scope.$evalAsync(() => {
                $scope.totalCustomers = response.data.count;
            });
        }, (error) => {
            $scope.totalCustomers = 'n/a';
            console.error(error);
        }
        );
});
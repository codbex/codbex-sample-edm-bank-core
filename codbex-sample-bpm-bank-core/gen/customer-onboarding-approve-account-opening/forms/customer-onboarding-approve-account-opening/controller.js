angular.module('forms', ['blimpKit', 'platformView', 'platformLocale']).controller('FormController', ($scope, $http, LocaleService, ViewParameters) => {
    $scope.forms = {
        form: {}
    };

    $scope.model = {};
    $scope.model.firstName = `firstName`;
    $scope.model.lastName = `lastName`;
    $scope.model.dateOfBirth = `dateOfBirth`;
    $scope.model.customerNumber = `customerNumber`;
    $scope.model.profileNotes = `profileNotes`;
    $scope.model.initialBalance = 0;

    const Dialogs = new DialogHub();
    
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('taskId');
    
    $http.get(`/services/ts/codbex-sample-bpm-bank-core/api/accountData.ts?taskId=${taskId}`).then((response) => {
        const accountData = response.data;
        $scope.model.customerNumber = accountData.customerNumber;
        $scope.model.firstName = accountData.firstName;
        $scope.model.lastName = accountData.lastName;
        $scope.model.dateOfBirth = new Date(accountData.dateOfBirth);
        $scope.model.profileNotes = accountData.profileNotes;
        $scope.model.initialBalance = 0;
    }, (error) => {
        console.error(error);
    });
    
    $scope.createAccount = function () {
        $http.post(`/services/ts/codbex-sample-bpm-bank-core/api/accountData.ts?taskId=${taskId}`, {
            initialBalance: $scope.model.initialBalance,
        }).then((response) => {
                alert(`Account created successfully`);
            }, (response) => {
                alert(`Failed to create new account: ${response.data.message}`);
            }
        );
    }

});
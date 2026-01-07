angular.module('forms', ['blimpKit', 'platformView', 'platformLocale']).controller('FormController', ($scope, $http, LocaleService, ViewParameters) => {
    $scope.forms = {
        form: {}
    };

    $scope.model = {};

    const Dialogs = new DialogHub();
    
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('taskId');
    
    $http.get(`/services/ts/codbex-sample-bpm-bank-core/api/customerData.ts?taskId=${taskId}`).then((response) => {
        const customerData = response.data;
        $scope.model.firstName = customerData.firstName;
        $scope.model.lastName = customerData.lastName;
        $scope.model.dateOfBirth = new Date(customerData.dateOfBirth);
        $scope.model.profileNotes = customerData.profileNotes;
    
        const img = document.querySelector('.bk-contain-image');
        img.src = `/services/js/documents/api/documents.js/preview?path=${customerData.documentPath}`;
        setTimeout(() => {
            img.height = 400;
        }, 2000)
    
    }, (error) => {
        console.error(error);
    });
    
    $scope.createCustomer = function () {
        $http.post(`/services/ts/codbex-sample-bpm-bank-core/api/customerData.ts?taskId=${taskId}`, {
            firstName: $scope.model.firstName,
            lastName: $scope.model.lastName,
            dateOfBirth: $scope.model.dateOfBirth,
            profileNotes: $scope.model.profileNotes,
        }).then((response) => {
            alert(`Customer created successfully`);
            $scope.model = {};
            const img = document.querySelector('.bk-contain-image');
            img.src = '/services/web/resources/images/unknown.svg';
        }, (response) => {
            alert(`Failed to create new customer: ${response.data.message}`);
        });
    }

});
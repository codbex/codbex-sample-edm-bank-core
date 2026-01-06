angular.module('customer-onboarding', ['blimpKit', 'platformView']).controller('customerOnboardingController', ($scope, $http) => {
    const Dialogs = new DialogHub();

    $scope.openDialog = () => {
        if (viewData && viewData.dialogId) {
            Dialogs.showWindow({
                id: viewData.dialogId,
                closeButton: true,
            });
        }
    };

});
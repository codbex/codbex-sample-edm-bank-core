angular.module('forms', ['blimpKit', 'platformView', 'angularFileUpload']).controller('FormController', ($scope, $http, ViewParameters, FileUploader) => {
    $scope.forms = {
        form: {}
    };

    $scope.model = {
    };

    const Dialogs = new DialogHub();
    const Notifications = new NotificationHub();
    const documentsApi = '/services/js/documents/api/documents.js';

    $scope.uploader = new FileUploader({
        url: documentsApi
    });

    $scope.uploader.headers['X-Requested-With'] = 'Fetch';

    $scope.uploader.onAfterAddingAll = (addedFileItems) => {
        $scope.fileName = addedFileItems[0].file.name;
        addedFileItems[0].url = `${documentsApi}?path=/${getFolder()}/${$scope.fileName}`;
        debugger
        $scope.loading = true;

        $http.post('/services/js/documents/api/documents.js/folder', {
            parentFolder: '/',
            name: `${getFolder()}`
        }).then((_response) => {
            debugger
            $scope.uploader.uploadAll();
        }, (response) => {
            debugger
            console.error(response);
            Notifications.show({
                title: 'Failed to upload item',
                description: response.data ?? 'Could not upload item. Check console for errors.',
                type: 'negative'
            });
        });
    }

    $scope.uploader.onErrorItem = (_fileItem, response, _status, _headers) => {
        debugger
        $scope.loading = false;

        Notifications.show({
            title: 'Failed to upload item',
            description: response.err.message ?? 'Could not upload item. Check console for errors.',
            type: 'negative'
        });
    }

    $scope.uploader.onCompleteAll = () => {
        debugger
        const documentPath = `${getFolder()}/${$scope.fileName}`;

        Notifications.show({
            title: 'Document uploaded successfully',
            description: `File location: "${documentPath}"`,
            type: 'positive'
        });

        $http.post('/services/ts/codbex-sample-dashboard-bank-core/customer-onboarding/service.ts', {
            documentPath: documentPath,
        }).then((response) => {
            Notifications.show({
                title: 'Customer onboarding process started',
                description: `${response.data.status}`,
                type: 'positive'
            });
            Dialogs.closeWindow({
                id: 'bank-core-customer-onboarding'
            });
        }, (response) => {
            console.error(response);
            Notifications.show({
                title: 'Error occurred while starting customer onboarding process',
                description: `${response.data.errorMessage}`,
                type: 'negative'
            });
            Dialogs.closeWindow({
                id: 'bank-core-customer-onboarding'
            });
        });
    }

    $scope.uploadDocument = function () {
        $('#fileUpload').click();
    }

    function getFolder() {
        const now = new Date();

        const timestamp = now.toISOString()
            .replace(/T/, '/')
            .replace(/:/g, '-')
            .replace(/\..+/, '');

        const uuid = crypto.randomUUID();

        // return `BankCore/${timestamp}/${uuid}`;
        return `BankCore`;
    }

});
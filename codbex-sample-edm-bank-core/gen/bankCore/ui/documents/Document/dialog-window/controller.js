angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/documents/DocumentController.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Document successfully created';
		let propertySuccessfullyUpdated = 'Document successfully updated';

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Document Details',
			create: 'Create Document',
			update: 'Update Document'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadSelect', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)' });
			$scope.formHeaders.create = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadCreate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)' });
			$scope.formHeaders.update = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadUpdate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			if (params.entity.uploadedAt) {
				params.entity.uploadedAt = new Date(params.entity.uploadedAt);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionscustomerId = params.optionscustomerId;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.documents.Document.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToCreate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.documents.Document.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToUpdate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.servicecustomerId = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/customers/CustomerController.ts';
		
		$scope.optionscustomerId = [];
		
		$http.get('/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/customers/CustomerController.ts').then((response) => {
			$scope.optionscustomerId = response.data.map(e => ({
				value: e.id,
				text: e.customerNumber
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'customerId',
				message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'Document-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});
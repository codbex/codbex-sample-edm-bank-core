angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/customers/CustomerController.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Customer successfully created';
		let propertySuccessfullyUpdated = 'Customer successfully updated';

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Customer Details',
			create: 'Create Customer',
			update: 'Update Customer'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadSelect', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.CUSTOMER)' });
			$scope.formHeaders.create = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadCreate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.CUSTOMER)' });
			$scope.formHeaders.update = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadUpdate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.CUSTOMER)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.CUSTOMER)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.CUSTOMER)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			if (params.entity.dateOfBirth) {
				params.entity.dateOfBirth = new Date(params.entity.dateOfBirth);
			}
			if (params.entity.createdAt) {
				params.entity.createdAt = new Date(params.entity.createdAt);
			}
			if (params.entity.updatedAt) {
				params.entity.updatedAt = new Date(params.entity.updatedAt);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.customers.Customer.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.CUSTOMER'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToCreate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.CUSTOMER)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.customers.Customer.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.CUSTOMER'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToUpdate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.CUSTOMER)', message: message });
				});
				console.error('EntityService:', error);
			});
		};


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
			Dialogs.closeWindow({ id: 'Customer-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});
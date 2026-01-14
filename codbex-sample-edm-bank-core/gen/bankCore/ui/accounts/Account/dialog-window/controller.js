angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/accounts/AccountController.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Account successfully created';
		let propertySuccessfullyUpdated = 'Account successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Account Details',
			create: 'Create Account',
			update: 'Update Account'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadSelect', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)' });
			$scope.formHeaders.create = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadCreate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)' });
			$scope.formHeaders.update = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadUpdate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			if (params.entity.openedOn) {
				params.entity.openedOn = new Date(params.entity.openedOn);
			}
			if (params.entity.lastAccessTime) {
				params.entity.lastAccessTime = new Date(params.entity.lastAccessTime);
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
			$scope.optionscustomerId = params.optionscustomerId;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToCreate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entityUpdated', data: response.data });
				$scope.cancel();
				Notifications.show({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToUpdate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)', message: message });
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
			Dialogs.closeWindow({ id: 'Account-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});
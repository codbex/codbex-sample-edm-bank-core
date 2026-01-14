angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/accounts/AccountController.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, LocaleService, EntityService) => {
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

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-sample-edm-bank-core-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'accounts' && e.view === 'Account' && e.type === 'entity');
		});

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.id
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Account.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionscustomerId = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.openedOn) {
					data.entity.openedOn = new Date(data.entity.openedOn);
				}
				if (data.entity.lastAccessTime) {
					data.entity.lastAccessTime = new Date(data.entity.lastAccessTime);
				}
				if (data.entity.createdAt) {
					data.entity.createdAt = new Date(data.entity.createdAt);
				}
				if (data.entity.updatedAt) {
					data.entity.updatedAt = new Date(data.entity.updatedAt);
				}
				$scope.entity = data.entity;
				$scope.optionscustomerId = data.optionscustomerId;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Account.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionscustomerId = data.optionscustomerId;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Account.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.openedOn) {
					data.entity.openedOn = new Date(data.entity.openedOn);
				}
				if (data.entity.lastAccessTime) {
					data.entity.lastAccessTime = new Date(data.entity.lastAccessTime);
				}
				if (data.entity.createdAt) {
					data.entity.createdAt = new Date(data.entity.createdAt);
				}
				if (data.entity.updatedAt) {
					data.entity.updatedAt = new Date(data.entity.updatedAt);
				}
				$scope.entity = data.entity;
				$scope.optionscustomerId = data.optionscustomerId;
				$scope.action = 'update';
			});
		}});

		$scope.servicecustomerId = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/customers/CustomerController.ts';

		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Account.clearDetails' , data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT'),
					message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToCreate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Account.clearDetails', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT'),
					message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToCreate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-sample-edm-bank-core.accounts.Account.clearDetails');
		};
		
		//-----------------Dialogs-------------------//
		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};
		
		$scope.createcustomerId = () => {
			Dialogs.showWindow({
				id: 'Customer-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshcustomerId = () => {
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
		};

		//----------------Dropdowns-----------------//	
	});
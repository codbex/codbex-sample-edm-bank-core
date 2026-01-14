angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/accounts/TransactionController.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Transaction successfully created';
		let propertySuccessfullyUpdated = 'Transaction successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Transaction Details',
			create: 'Create Transaction',
			update: 'Update Transaction'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadSelect', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)' });
			$scope.formHeaders.create = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadCreate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)' });
			$scope.formHeaders.update = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.formHeadUpdate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;

			if (params.entity.createdOn) {
				params.entity.createdOn = new Date(params.entity.createdOn);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsaccountId = params.optionsaccountId;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Transaction.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION'),
					message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToCreate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Transaction.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION'),
					message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToUpdate', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceaccountId = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/accounts/AccountController.ts';

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
			Dialogs.closeWindow({ id: 'Transaction-details' });
		};
	});
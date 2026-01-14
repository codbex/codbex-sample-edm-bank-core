angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/accounts/TransactionController.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete Transaction? This action cannot be undone.',
			deleteTitle: 'Delete Transaction?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.yes');
			translated.no = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.deleteTitle', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)' });
			translated.deleteConfirm = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.deleteConfirm', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)' });
		});
		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-sample-edm-bank-core-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'accounts' && e.view === 'Transaction' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'accounts' && e.view === 'Transaction' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					selectedMainEntityKey: 'accountId',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.id,
					selectedMainEntityKey: 'accountId',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entitySelected', handler: (data) => {
			resetPagination();
			$scope.selectedMainEntityId = data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Account.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Transaction.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Transaction.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Transaction.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Transaction.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			let accountId = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			if (!filter.$filter) {
				filter.$filter = {};
			}
			if (!filter.$filter.equals) {
				filter.$filter.equals = {};
			}
			filter.$filter.equals.accountId = accountId;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				EntityService.search(filter).then((response) => {
					response.data.forEach(e => {
						if (e.createdOn) {
							e.createdOn = new Date(e.createdOn);
						}
					});

					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION'),
						message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToLF', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION'),
					message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToCount', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'Transaction-details',
				params: {
					action: 'select',
					entity: entity,
					optionsaccountId: $scope.optionsaccountId,
				},
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'Transaction-filter',
				params: {
					entity: $scope.filterEntity,
					optionsaccountId: $scope.optionsaccountId,
				},
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'Transaction-details',
				params: {
					action: 'create',
					entity: {
						'accountId': $scope.selectedMainEntityId
					},
					selectedMainEntityKey: 'accountId',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsaccountId: $scope.optionsaccountId,
				},
				closeButton: false
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'Transaction-details',
				params: {
					action: 'update',
					entity: entity,
					selectedMainEntityKey: 'accountId',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsaccountId: $scope.optionsaccountId,
			},
				closeButton: false
			});
		};

		$scope.deleteEntity = (entity) => {
			let id = entity.id;
			Dialogs.showDialog({
				title: translated.deleteTitle,
				message: translated.deleteConfirm,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: translated.yes,
				}, {
					id: 'delete-btn-no',
					label: translated.no,
				}],
				closeButton: false
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then(() => {
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-sample-edm-bank-core.accounts.Transaction.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION'),
							message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToDelete', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.TRANSACTION)', message: message }),
							type: AlertTypes.Error,
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsaccountId = [];


		$http.get('/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/accounts/AccountController.ts').then((response) => {
			$scope.optionsaccountId = response.data.map(e => ({
				value: e.id,
				text: e.iban
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'accountId',
				message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$scope.optionsaccountIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsaccountId.length; i++) {
				if ($scope.optionsaccountId[i].value === optionKey) {
					return $scope.optionsaccountId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});

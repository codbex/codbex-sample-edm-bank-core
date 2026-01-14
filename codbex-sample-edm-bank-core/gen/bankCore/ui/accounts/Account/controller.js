angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/accounts/AccountController.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete Account? This action cannot be undone.',
			deleteTitle: 'Delete Account?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.yes');
			translated.no = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.deleteTitle', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)' });
			translated.deleteConfirm = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.deleteConfirm', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)' });
		});
		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-sample-edm-bank-core-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'accounts' && e.view === 'Account' && (e.type === 'page' || e.type === undefined));
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function refreshData() {
			$scope.dataReset = true;
			$scope.dataPage--;
		}

		function resetPagination() {
			$scope.dataReset = true;
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Account.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.selectedEntity = null;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entityCreated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entityUpdated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			$scope.selectedEntity = null;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
				filter.$offset = ($scope.dataPage - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				if ($scope.dataReset) {
					filter.$offset = 0;
					filter.$limit = $scope.dataPage * $scope.dataLimit;
				}

				EntityService.search(filter).then((response) => {
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}
					response.data.forEach(e => {
						if (e.openedOn) {
							e.openedOn = new Date(e.openedOn);
						}
						if (e.lastAccessTime) {
							e.lastAccessTime = new Date(e.lastAccessTime);
						}
						if (e.createdAt) {
							e.createdAt = new Date(e.createdAt);
						}
						if (e.updatedAt) {
							e.updatedAt = new Date(e.updatedAt);
						}
					});

					$scope.data = $scope.data.concat(response.data);
					$scope.dataPage++;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT'),
						message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToLF', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT'),
					message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToCount', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entitySelected', data: {
				entity: entity,
				selectedMainEntityId: entity.id,
				optionscustomerId: $scope.optionscustomerId,
			}});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			$scope.action = 'create';

			Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Account.createEntity', data: {
				entity: {},
				optionscustomerId: $scope.optionscustomerId,
			}});
		};

		$scope.updateEntity = () => {
			$scope.action = 'update';
			Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Account.updateEntity', data: {
				entity: $scope.selectedEntity,
				optionscustomerId: $scope.optionscustomerId,
			}});
		};

		$scope.deleteEntity = () => {
			let id = $scope.selectedEntity.id;
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
						refreshData();
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-sample-edm-bank-core.accounts.Account.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT'),
							message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToDelete', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.ACCOUNT)', message: message }),
							type: AlertTypes.Error
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'Account-filter',
				params: {
					entity: $scope.filterEntity,
					optionscustomerId: $scope.optionscustomerId,
				},
			});
		};

		//----------------Dropdowns-----------------//
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

		$scope.optionscustomerIdValue = (optionKey) => {
			for (let i = 0; i < $scope.optionscustomerId.length; i++) {
				if ($scope.optionscustomerId[i].value === optionKey) {
					return $scope.optionscustomerId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});

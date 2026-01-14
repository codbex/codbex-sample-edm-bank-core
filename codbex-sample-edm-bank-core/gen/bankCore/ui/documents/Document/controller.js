angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-edm-bank-core/gen/bankCore/api/documents/DocumentController.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete Document? This action cannot be undone.',
			deleteTitle: 'Delete Document?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.yes');
			translated.no = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.deleteTitle', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)' });
			translated.deleteConfirm = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.deleteConfirm', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)' });
		});

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-sample-edm-bank-core-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'documents' && e.view === 'Document' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'documents' && e.view === 'Document' && e.type === 'entity');
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

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.documents.Document.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.documents.Document.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-edm-bank-core.documents.Document.entitySearch', handler: (data) => {
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
			$scope.dataPage = pageNumber;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = EntityService.search(filter);
				} else {
					request = EntityService.list(offset, limit);
				}
				request.then((response) => {
					response.data.forEach(e => {
						if (e.uploadedAt) {
							e.uploadedAt = new Date(e.uploadedAt);
						}
					});

					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT'),
						message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToLF', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT'),
					message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToCount', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'Document-details',
				params: {
					action: 'select',
					entity: entity,
					optionscustomerId: $scope.optionscustomerId,
				},
				closeButton: true,
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'Document-filter',
				params: {
					entity: $scope.filterEntity,
					optionscustomerId: $scope.optionscustomerId,
				},
				closeButton: true,
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'Document-details',
				params: {
					action: 'create',
					entity: {},
					optionscustomerId: $scope.optionscustomerId,
				},
				closeButton: false,
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'Document-details',
				params: {
					action: 'update',
					entity: entity,
					optionscustomerId: $scope.optionscustomerId,
				},
				closeButton: false,
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
				}]
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then((response) => {
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-sample-edm-bank-core.documents.Document.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT'),
							message: LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.messages.error.unableToDelete', { name: '$t(codbex-sample-edm-bank-core:bankCore-model.t.DOCUMENT)', message: message }),
							type: AlertTypes.Error
						});
						console.error('EntityService:', error);
					});
				}
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
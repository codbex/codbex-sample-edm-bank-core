angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, ViewParameters, LocaleService) => {
	const Dialogs = new DialogHub();
	let description = 'Description';
	$scope.entity = {};
	$scope.forms = {
		details: {},
	};

	LocaleService.onInit(() => {
		description = LocaleService.t('codbex-sample-edm-bank-core:bankCore-model.defaults.description');
	});

	let params = ViewParameters.get();
	if (Object.keys(params).length) {
		if (params?.entity?.createdAtFrom) {
			params.entity.createdAtFrom = new Date(params.entity.createdAtFrom);
		}
		if (params?.entity?.createdAtTo) {
			params.entity.createdAtTo = new Date(params.entity.createdAtTo);
		}
		$scope.entity = params.entity ?? {};
		$scope.selectedMainEntityKey = params.selectedMainEntityKey;
		$scope.selectedMainEntityId = params.selectedMainEntityId;
	}

	$scope.filter = () => {
		let entity = $scope.entity;
		const filter = {
			$filter: {
				equals: {
				},
				notEquals: {
				},
				contains: {
				},
				greaterThan: {
				},
				greaterThanOrEqual: {
				},
				lessThan: {
				},
				lessThanOrEqual: {
				}
			},
		};
		if (entity.id !== undefined) {
			filter.$filter.equals.id = entity.id;
		}
		if (entity.entityName) {
			filter.$filter.contains.entityName = entity.entityName;
		}
		if (entity.entityId !== undefined) {
			filter.$filter.equals.entityId = entity.entityId;
		}
		if (entity.operation) {
			filter.$filter.contains.operation = entity.operation;
		}
		if (entity.createdAtFrom) {
			filter.$filter.greaterThanOrEqual.createdAt = entity.createdAtFrom;
		}
		if (entity.createdAtTo) {
			filter.$filter.lessThanOrEqual.createdAt = entity.createdAtTo;
		}
		Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.auditLogs.AuditLog.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
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
		Dialogs.closeWindow({ id: 'AuditLog-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});
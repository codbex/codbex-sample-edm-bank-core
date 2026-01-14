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
		if (params?.entity?.uploadedAtFrom) {
			params.entity.uploadedAtFrom = new Date(params.entity.uploadedAtFrom);
		}
		if (params?.entity?.uploadedAtTo) {
			params.entity.uploadedAtTo = new Date(params.entity.uploadedAtTo);
		}
		$scope.entity = params.entity ?? {};
		$scope.selectedMainEntityKey = params.selectedMainEntityKey;
		$scope.selectedMainEntityId = params.selectedMainEntityId;
		$scope.optionscustomerId = params.optionscustomerId;
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
		if (entity.customerId !== undefined) {
			filter.$filter.equals.customerId = entity.customerId;
		}
		if (entity.documentType) {
			filter.$filter.contains.documentType = entity.documentType;
		}
		if (entity.fileName) {
			filter.$filter.contains.fileName = entity.fileName;
		}
		if (entity.checksum) {
			filter.$filter.contains.checksum = entity.checksum;
		}
		if (entity.uploadedAtFrom) {
			filter.$filter.greaterThanOrEqual.uploadedAt = entity.uploadedAtFrom;
		}
		if (entity.uploadedAtTo) {
			filter.$filter.lessThanOrEqual.uploadedAt = entity.uploadedAtTo;
		}
		Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.documents.Document.entitySearch', data: {
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
		Dialogs.closeWindow({ id: 'Document-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});
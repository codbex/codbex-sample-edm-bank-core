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
		if (params?.entity?.dateOfBirthFrom) {
			params.entity.dateOfBirthFrom = new Date(params.entity.dateOfBirthFrom);
		}
		if (params?.entity?.dateOfBirthTo) {
			params.entity.dateOfBirthTo = new Date(params.entity.dateOfBirthTo);
		}
		if (params?.entity?.createdAtFrom) {
			params.entity.createdAtFrom = new Date(params.entity.createdAtFrom);
		}
		if (params?.entity?.createdAtTo) {
			params.entity.createdAtTo = new Date(params.entity.createdAtTo);
		}
		if (params?.entity?.updatedAtFrom) {
			params.entity.updatedAtFrom = new Date(params.entity.updatedAtFrom);
		}
		if (params?.entity?.updatedAtTo) {
			params.entity.updatedAtTo = new Date(params.entity.updatedAtTo);
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
		if (entity.customerNumber) {
			filter.$filter.contains.customerNumber = entity.customerNumber;
		}
		if (entity.type) {
			filter.$filter.contains.type = entity.type;
		}
		if (entity.firstName) {
			filter.$filter.contains.firstName = entity.firstName;
		}
		if (entity.lastName) {
			filter.$filter.contains.lastName = entity.lastName;
		}
		if (entity.dateOfBirthFrom) {
			filter.$filter.greaterThanOrEqual.dateOfBirth = entity.dateOfBirthFrom;
		}
		if (entity.dateOfBirthTo) {
			filter.$filter.lessThanOrEqual.dateOfBirth = entity.dateOfBirthTo;
		}
		if (entity.isActive !== undefined && entity.isisActiveIndeterminate === false) {
			filter.$filter.equals.isActive = entity.isActive;
		}
		if (entity.riskScore !== undefined) {
			filter.$filter.equals.riskScore = entity.riskScore;
		}
		if (entity.createdAtFrom) {
			filter.$filter.greaterThanOrEqual.createdAt = entity.createdAtFrom;
		}
		if (entity.createdAtTo) {
			filter.$filter.lessThanOrEqual.createdAt = entity.createdAtTo;
		}
		if (entity.updatedAtFrom) {
			filter.$filter.greaterThanOrEqual.updatedAt = entity.updatedAtFrom;
		}
		if (entity.updatedAtTo) {
			filter.$filter.lessThanOrEqual.updatedAt = entity.updatedAtTo;
		}
		Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.customers.Customer.entitySearch', data: {
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
		Dialogs.closeWindow({ id: 'Customer-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});
angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, ViewParameters) => {
	const Dialogs = new DialogHub();
	$scope.entity = {};
	$scope.forms = {
		details: {},
	};

	let params = ViewParameters.get();
	if (Object.keys(params).length) {
		if (params?.entity?.openedOnFrom) {
			params.entity.openedOnFrom = new Date(params.entity.openedOnFrom);
		}
		if (params?.entity?.openedOnTo) {
			params.entity.openedOnTo = new Date(params.entity.openedOnTo);
		}
		if (params?.entity?.lastAccessTimeFrom) {
			params.entity.lastAccessTimeFrom = new Date(params.entity.lastAccessTimeFrom);
		}
		if (params?.entity?.lastAccessTimeTo) {
			params.entity.lastAccessTimeTo = new Date(params.entity.lastAccessTimeTo);
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
		if (entity.iban) {
			filter.$filter.contains.iban = entity.iban;
		}
		if (entity.customerId !== undefined) {
			filter.$filter.equals.customerId = entity.customerId;
		}
		if (entity.currency) {
			filter.$filter.contains.currency = entity.currency;
		}
		if (entity.balance !== undefined) {
			filter.$filter.equals.balance = entity.balance;
		}
		if (entity.overdraftLimit !== undefined) {
			filter.$filter.equals.overdraftLimit = entity.overdraftLimit;
		}
		if (entity.status !== undefined) {
			filter.$filter.equals.status = entity.status;
		}
		if (entity.openedOnFrom) {
			filter.$filter.greaterThanOrEqual.openedOn = entity.openedOnFrom;
		}
		if (entity.openedOnTo) {
			filter.$filter.lessThanOrEqual.openedOn = entity.openedOnTo;
		}
		if (entity.lastAccessTimeFrom) {
			filter.$filter.greaterThanOrEqual.lastAccessTime = entity.lastAccessTimeFrom;
		}
		if (entity.lastAccessTimeTo) {
			filter.$filter.lessThanOrEqual.lastAccessTime = entity.lastAccessTimeTo;
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
		Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Account.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		Dialogs.triggerEvent('codbex-sample-edm-bank-core.accounts.Account.clearDetails');
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'Account-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});
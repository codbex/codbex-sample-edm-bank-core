angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, ViewParameters) => {
	const Dialogs = new DialogHub();
	$scope.entity = {};
	$scope.forms = {
		details: {},
	};

	let params = ViewParameters.get();
	if (Object.keys(params).length) {
		if (params?.entity?.createdOnFrom) {
			params.entity.createdOnFrom = new Date(params.entity.createdOnFrom);
		}
		if (params?.entity?.createdOnTo) {
			params.entity.createdOnTo = new Date(params.entity.createdOnTo);
		}
		$scope.entity = params.entity ?? {};
		$scope.selectedMainEntityKey = params.selectedMainEntityKey;
		$scope.selectedMainEntityId = params.selectedMainEntityId;
		$scope.optionsaccountId = params.optionsaccountId;
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
		if (entity.accountId !== undefined) {
			filter.$filter.equals.accountId = entity.accountId;
		}
		if (entity.reference) {
			filter.$filter.contains.reference = entity.reference;
		}
		if (entity.amount !== undefined) {
			filter.$filter.equals.amount = entity.amount;
		}
		if (entity.direction) {
			filter.$filter.contains.direction = entity.direction;
		}
		if (entity.fee !== undefined) {
			filter.$filter.equals.fee = entity.fee;
		}
		if (entity.exchangeRate !== undefined) {
			filter.$filter.equals.exchangeRate = entity.exchangeRate;
		}
		if (entity.approved !== undefined && entity.isapprovedIndeterminate === false) {
			filter.$filter.equals.approved = entity.approved;
		}
		if (entity.createdOnFrom) {
			filter.$filter.greaterThanOrEqual.createdOn = entity.createdOnFrom;
		}
		if (entity.createdOnTo) {
			filter.$filter.lessThanOrEqual.createdOn = entity.createdOnTo;
		}
		Dialogs.postMessage({ topic: 'codbex-sample-edm-bank-core.accounts.Transaction.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'Transaction-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});
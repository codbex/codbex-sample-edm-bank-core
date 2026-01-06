const viewData = {
    id: 'customer-onboarding',
    label: 'Customer Onboarding',
    path: '/services/web/codbex-sample-dashboard-bank-core/customer-onboarding/index.html',
    lazyLoad: true,
    autoFocusTab: false,
    perspectiveId: null,
    dialogId: 'bank-core-customer-onboarding',
    size: 'small'
};
if (typeof exports !== 'undefined') {
    exports.getView = () => viewData;
}
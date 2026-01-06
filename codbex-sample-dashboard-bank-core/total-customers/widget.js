const viewData = {
    id: 'total-customers',
    label: 'Total Customers',
    path: '/services/web/codbex-sample-dashboard-bank-core/total-customers/index.html',
    lazyLoad: true,
    autoFocusTab: false,
    perspectiveId: 'Customers',
    size: 'small'
};
if (typeof exports !== 'undefined') {
    exports.getView = () => viewData;
}
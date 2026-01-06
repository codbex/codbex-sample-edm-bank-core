const viewData = {
    id: 'total-accounts',
    label: 'Total Accounts',
    path: '/services/web/codbex-sample-dashboard-bank-core/total-accounts/index.html',
    lazyLoad: true,
    autoFocusTab: false,
    perspectiveId: 'Accounts',
    size: 'small'
};
if (typeof exports !== 'undefined') {
    exports.getView = () => viewData;
}
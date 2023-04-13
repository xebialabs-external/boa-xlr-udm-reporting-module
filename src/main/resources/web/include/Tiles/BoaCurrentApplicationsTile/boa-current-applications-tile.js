import template from './boa-current-applications-tile.html';

class BoaCurrentApplicationsTileController {
    static $inject = ['ReportLoader', 'Report', 'ReportTileService', '$uibModal', 'DeploymentTileService'];

    constructor(ReportLoader, Report, ReportTileService, $uibModal, DeploymentTileService) {
        this.loader = new ReportLoader();
        this.report = new Report();
        this.ReportTileService = ReportTileService;
        this.$uibModal = $uibModal;
        this.DeploymentTileService = DeploymentTileService;
    }

    $onInit() {
        this.report.add('data', this.loader);
        this.loadData(this.tile, this.loader);
    }

    loadData(tile, loader) {
        this.loader.startLoading();
        this.DeploymentTileService.fetchTileData(this.tile.id, {
            params: {
                page: tile.sizeY !== null ? tile.sizeY * 3 : 3,
                offset: 0
            },
        })
            .then(resp => loader.loaded(resp.data.data))
            .then(loader.endLoading, loader.failLoading);
    }

    showDetails() {
        const dateFilter = this.ReportTileService.getDateFilter(this.tile);
        this.$uibModal.open({
            component: 'boaCurrentApplicationsDetails',
            resolve: {
                data: {
                    timeFrame: dateFilter.timeFrame,
                    dateFrom: dateFilter.from,
                    dateTo: dateFilter.to,
                    tile: this.tile,
                },
            },
            windowClass: 'deployment-dialog',
        });
    }
}

export const boaCurrentApplicationsTile = {
    bindings: {
        tile: '<',
        parent: '<',
    },
    controller: BoaCurrentApplicationsTileController,
    template,
};
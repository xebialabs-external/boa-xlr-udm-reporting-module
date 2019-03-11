//<!--
//
//    Copyright 2019 XEBIALABS
//
//    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
//    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
//-->
import template from './current-applications-tile.html';

class CurrentApplicationsTileController {
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
            }
        })
        .then(resp => loader.loaded(resp.data.data))
        .then(loader.endLoading, loader.failLoading);
    }

    showDetails() {
        const dateFilter = this.ReportTileService.getDateFilter(this.tile);
        this.$uibModal.open({
            component: 'currentApplicationsDetails',
            resolve: {
                data: {
                    timeFrame: dateFilter.timeFrame,
                    dateFrom: dateFilter.from,
                    dateTo: dateFilter.to,
                    tile: this.tile
                }
            },
            windowClass: 'deployment-dialog',
        });
    }

}

export const currentApplicationsTile = {
    bindings: {
        tile: '<',
        parent: '<'
    },
    controller: CurrentApplicationsTileController,
    template
};

import {DEPLOYMENT_STATE} from '../../BoaDeploymentTile/services/boa-deployment-tile-constants';
import colors from '../../BoaDeploymentTile/common/colors';
import './boa-deployments-distribution-tile.less';

const template = `
    <report-tile class=" deployments-distribution-tile" report="$ctrl.report" tile="$ctrl.tile" parent="$ctrl.parent">
        <report-content>
            <div class="deployments-distribution-delimiter"></div>
            <echarts ng-if="$ctrl.echartsOptions"
                     container=".xlr-tile"
                     options="$ctrl.echartsOptions"
                     ec-click="$ctrl.showDetails(params)">
            </echarts>
        </report-content>
    </report-tile>
`;

class BoaDeploymentsDistributionTileController {
    static $inject = ['ReportLoader', 'Report', 'BoaDeploymentTileService', '$uibModal', 'ReportTileService'];

    constructor(ReportLoader, Report, BoaDeploymentTileService, $uibModal, ReportTileService) {
        this.BoaDeploymentTileService = BoaDeploymentTileService;
        this.$uibModal = $uibModal;
        this.ReportTileService = ReportTileService;

        this.loader = new ReportLoader();
        this.report = new Report().add('data', this.loader);
    }

    $onInit() {
        this.loader.startLoading();
        this.BoaDeploymentTileService.fetchTileData(this.tile.id).then(resp => {
                const data = resp.data.data;
                const hasData = !!data;
                this.loader.endLoading();
                this.loader.loaded(hasData);
                if (hasData) {
                    this.initEchartsOptions(data);
                }
            });
    }

    showDetails(params) {
        const dateFilter = this.ReportTileService.getDateFilter(this.tile);
        this.$uibModal.open({
            component: 'boaDeploymentActivityDetails',
            resolve: {
                data: {
                    selectedState: _.get(this.data[params.dataIndex], 'deploymentState'),
                    timeFrame: dateFilter.timeFrame,
                    dateFrom: dateFilter.from,
                    dateTo: dateFilter.to,
                    tile: this.tile
                }
            },
            windowClass: 'deployment-dialog',
        });
    }

    initEchartsOptions(data) {
        let titleItemGap = -40;
        let titleFontSize = 30;
        let legendBottom = 15;
        let seriesRadius = [70, 90];

        if (this.tile.sizeY < 2) {
            titleItemGap = -25;
            titleFontSize = 22;
            legendBottom = 0;
            seriesRadius = [45, '70%'];
        }

        const successful = data.successful || 0;
        const failed = data.failed || 0;
        this.data = [
            {
                name: 'Successful',
                icon: 'circle',
                textStyle: {
                    color: colors.gray,
                    fontSize: 11,
                },
                deploymentState: DEPLOYMENT_STATE.successful.value
            },
            {
                name: 'Failed',
                icon: 'circle',
                textStyle: {
                    color: colors.gray,
                    fontSize: 11,
                },
                deploymentState: DEPLOYMENT_STATE.failed.value
            }
        ];

        this.echartsOptions = {
            title: {
                text: `${successful}\n`,
                subtext: `${failed}`,
                x: 'center',
                y: 'center',
                itemGap: titleItemGap,
                textStyle: {
                    color: colors.green,
                    fontSize: titleFontSize,
                    fontWeight: 600,
                    fontFamily: "Lato, 'Helvetica Neue', Helvetica, Arial, sans-serif",
                },
                subtextStyle: {
                    color: colors.red,
                    fontSize: titleFontSize,
                    fontWeight: 600,
                    fontFamily: "Lato, 'Helvetica Neue', Helvetica, Arial, sans-serif",
                },
            },
            color: [colors.green, colors.red],
            legend: {
                selectedMode: false,
                left: 'center',
                bottom: legendBottom,
                itemWidth: 10,
                data: this.data,
            },
            label: {
                normal: {
                    show: true,
                },
            },
            series: {
                type: 'pie',
                radius: seriesRadius,
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center',
                    },
                    emphasis: {
                        show: false,
                        textStyle: { fontSize: 16 },
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                    },
                },
                data: [
                    {
                        value: successful,
                        name: 'Successful',
                    },
                    {
                        value: failed,
                        name: 'Failed',
                    },
                ],
            },
        };
    }
}

export const boaDeploymentsDistributionTileComponent = {
    bindings: {
        tile: '<',
        parent: '<',
    },
    controller: BoaDeploymentsDistributionTileController,
    template,
};
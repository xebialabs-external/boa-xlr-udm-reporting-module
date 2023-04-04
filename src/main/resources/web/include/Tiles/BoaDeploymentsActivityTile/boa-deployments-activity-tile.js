import './boa-deployments-activity-tile.less';
import {DEPLOYMENT_STATE_ALL} from '../../BoaDeploymentTile/services/boa-deployment-tile-constants';

const template = `
    <report-tile class="deployments-activity-tile" report="$ctrl.report" tile="$ctrl.tile" parent="$ctrl.parent">
        <report-content>
            <div detect-fully-visible-items parent-selector=".card-content"
                 ng-if="$ctrl.deploymentsActivity">
                <div class="row" ng-repeat="activity in $ctrl.deploymentsActivity">
                    <div class="deployments-activity-entry">
                        <div class="col-sm-6 col-md-7 text-left deployments-activity-left-column">
                            <div>
                                <deployment-owner task-owner="activity.taskOwner" task-team="activity.taskTeam"></deployment-owner>
                            </div>
                            <div>
                                <i class="xl-icon app-icon"></i>
                                <span class="text-ellipsis" title="{{activity.applicationName}}">
                                    {{activity.applicationName}}
                                </span>
                            </div>
                            <div>
                                <i class="xl-icon package-icon"></i>
                                <span class="text-ellipsis" title="{{activity.version}}">
                                    {{activity.version}}
                                </span>
                            </div>
                            <div>
                                <i class="xl-icon environment-icon"></i>
                                <span class="text-ellipsis" title="{{activity.environmentName}}">{{activity.environmentName}}</span>
                            </div>
                        </div>
                        <div class="col-sm-6 col-md-5 text-right deployments-activity-right-column">
                            <deployment-state state-value="activity.state"></deployment-state>
                            <deployment-date full-date="false" change-date="activity.changeDate" class="deployment-date"></deployment-date>
                        </div>
                    </div>
                </div>
            </div>
        </report-content>
        <report-footer>
            <button ng-if="$ctrl.hasData()" class="show-deployment-activity btn-link" ng-click="$ctrl.showDetails(params)">
                Show all activity
            </button>
        </report-footer>
    </report-tile>
`;

const DEFAULT_PAGE_SIZE = 3;

class BoaDeploymentsActivityTileController {
    static $inject = ['ReportLoader', 'Report', 'DeploymentTileService', 'ReportTileService', '$uibModal'];

    constructor(ReportLoader, Report, DeploymentTileService, ReportTileService, $uibModal) {
        this.DeploymentTileService = DeploymentTileService;
        this.ReportTileService = ReportTileService;
        this.$uibModal = $uibModal;

        this.loader = new ReportLoader();
        this.report = new Report().add('data', this.loader);
    }

    $onInit() {
        const filterByState = !this.tile.properties.deploymentStatus.value ? '' : this.tile.properties.deploymentStatus.value.toLowerCase();
        this.loader.startLoading();
        this.DeploymentTileService.fetchTileData(this.tile.id, {
            params: {
                deploymentState: filterByState,
                pageSize: this.tile.sizeY * DEFAULT_PAGE_SIZE,
                offset: 0
            }
        }).then(resp => {
            this.deploymentsActivity = resp.data.data;
            this.loader.endLoading();
            this.loader.loaded(!!this.deploymentsActivity.length);
        });
    }

    hasData() {
        return this.report.isConfigured() && !this.report.loading() && !this.report.hasError() && !this.report.isEmpty();
    }

    showDetails() {
        const dateFilter = this.ReportTileService.getDateFilter(this.tile);
        this.$uibModal.open({
            component: 'boaDeploymentActivityDetails',
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

export const boaDeploymentsActivityTileComponent = {
    bindings: {
        tile: '<',
        parent: '<',
    },
    controller: BoaDeploymentsActivityTileController,
    template,
};
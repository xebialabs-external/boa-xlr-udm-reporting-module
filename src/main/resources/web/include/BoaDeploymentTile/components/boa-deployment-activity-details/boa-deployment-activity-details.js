import {DEPLOYMENT_STATE, DEPLOYMENT_STATE_ALL} from '../../services/boa-deployment-tile-constants';
import './boa-deployment-activity-details.less';

const template = `
    <div class="modal-header">
        <h5 class="modal-title pull-left deployments-activity-details-title">
            Activity in the <xlr-tile-date-range-label
                    class="xlr-tile-date-range-label"
                    time-frame="$ctrl.resolve.data.timeFrame"
                    from="$ctrl.resolve.data.dateFrom"
                    to="$ctrl.resolve.data.dateTo">
            </xlr-tile-date-range-label>
        </h5>
        <button type="button" class="close pull-right" ng-click="$ctrl.close()"><i class="glyphicon glyphicon-remove"/></button>
        <div class="clearfix" />
    </div>
    <div class="modal-body deployments-activity-details-body">        
        <div>
            <div class="btn-group btn-group-toggle mlm" data-toggle="buttons">
                <label class="btn" 
                    ng-class="{active: $ctrl.selectedState == '${DEPLOYMENT_STATE_ALL}'}"
                    ng-click="$ctrl.selectState('${DEPLOYMENT_STATE_ALL}')">
                    <input type="radio" name="selectedState" autocomplete="off" checked> All
                </label>
                <label class="btn"
                    ng-class="{active: $ctrl.selectedState == '${DEPLOYMENT_STATE.successful.value}'}"
                    ng-click="$ctrl.selectState('${DEPLOYMENT_STATE.successful.value}')">
                    <input type="radio" name="selectedState" autocomplete="off"> ${DEPLOYMENT_STATE.successful.label}
                </label>
                <label class="btn"
                    ng-class="{active: $ctrl.selectedState == '${DEPLOYMENT_STATE.failed.value}'}"
                    ng-click="$ctrl.selectState('${DEPLOYMENT_STATE.failed.value}')">
                    <input type="radio" name="selectedState" autocomplete="off"> ${DEPLOYMENT_STATE.failed.label}
                </label>
            </div>
            <div class="alert notice text-center mtl man" ng-if="!$ctrl.isLoading && !$ctrl.deploymentsActivity.length">No deployment activity found</div>
            <div class="table-responsive" ng-if="$ctrl.deploymentsActivity && $ctrl.deploymentsActivity.length">
                <table class="table">
                    <thead>
                        <tr>
                            <th class="col-sm-4">
                                <span class="state-column mlm">State</span>
                                <span class="task-in-release-column mll">Task in release</span>
                            </th>
                            <th class="col-sm-2">Component</th>
                            <th class="col-sm-1">Build Number</th>
                            <th class="col-sm-2">SPK-Environment</th>
                            <th class="col-sm-2">Date</th>
                        </tr>
                    </thead>
                </table>                
                <div class="table-body-container scrollable">
                    <xlr-infinite-scroll-wrapper
                         on-show-more="$ctrl.showMore()"
                         disable-when="!$ctrl.hasMore() || $ctrl.isLoading"
                         show-loader-when="$ctrl.isLoading">
                        <table class="table table-scrollable">
                            <tbody>
                                <tr ng-repeat="deployment in $ctrl.deploymentsActivity" xlr-infinite-scroll>
                                    <td class="col-sm-4 task-in-release">
                                        <span class="state-column text-center mlm">
                                            <task-icon
                                                    class="deployment-task-icon"
                                                    task-type="$ctrl.getTaskType(deployment)"
                                                    task-owner="deployment.taskOwner"
                                                    custom-icon-location="deployment.customIconLocation">
                                                </task-icon>
                                            <deployment-state state-value="deployment.state"></deployment-state>
                                        </span>
                                        <span class="task-in-release-column mll">
                                            <a href="{{$ctrl.getTaskUrl(deployment.releaseId, deployment.taskId)}}" ng-click="$ctrl.close()"
                                                   class="task-name link"
                                                   title="{{deployment.taskTitle}}">
                                                    {{::deployment.taskTitle}}
                                            </a>
                                            <a href="{{$ctrl.getReleaseUrl(deployment.releaseId)}}" ng-click="$ctrl.close()" class="release-name link"
                                               title="{{deployment.releaseTitle}}">
                                                {{::deployment.releaseTitle}}
                                            </a>
                                        </span>
                                    </td>
                                    <td class="col-sm-2">                                    
                                        <span class="mlm mrm" title="{{::deployment.applicationName}}">
                                            <i class="xlr-application-icon"></i> {{::deployment.applicationName}}
                                        </span>
                                    </td>
                                    <td class="col-sm-1">
                                        <span class="mrm mlm" title="{{::deployment.version}}">
                                            <i class="xlr-package-icon"></i> {{::deployment.version}}
                                        </span>
                                    </td>
                                    <td class="col-sm-2">                                    
                                        <span class="mrm mlm" title="{{::deployment.environmentName}}">
                                          <img class="xlr-react-icon smaller" src="static/@project.version@/include/assets/environment.svg">
                                            {{::deployment.environmentName}}
                                        </span>
                                    </td>
                                    <td class="col-sm-2">
                                        <span class="mlm">
                                            <deployment-date change-date="deployment.changeDate" full-date="true" class="mlm"></deployment-date>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </xlr-infinite-scroll-wrapper>
                </div>
            </div>
        </div>
    </div>    
`;

const ITEMS_PER_PAGE = 8;

class BoaDeploymentActivityDetailsController {

    static $inject = ['BoaDeploymentTileService', 'ViewStorage', 'Ids'];

    constructor(DeploymentTileService, ViewStorage, Ids) {
        this.DeploymentTileService = DeploymentTileService;
        this.DEPLOYMENT_STATE = DEPLOYMENT_STATE;
        this.ViewStorage = ViewStorage;
        this.Ids = Ids;
    }

    $onInit() {
        this.selectState(this.resolve.data.selectedState || DEPLOYMENT_STATE_ALL);
    }

    selectState(state) {
        this.deploymentsActivity = [];
        this.currentPage = 0;
        this.selectedState = state;
        this.hasData = false;
        this.fetchData();
    }

    showMore() {
        this.currentPage++;
        this.fetchData();
    }

    hasMore() {
        return this.hasData;
    }

    fetchData(page, offset) {
        this.isLoading = true;
        this.DeploymentTileService
            .fetchTileData(this.resolve.data.tile.id, {
                params: {
                    deploymentState: this.selectedState === DEPLOYMENT_STATE_ALL ? '' : this.selectedState,
                    pageSize: ITEMS_PER_PAGE,
                    offset: this.currentPage * ITEMS_PER_PAGE
                }
            })
            .then((resp) => {
                this.hasData = resp.data.data && resp.data.data.length;
                if (this.hasData) {
                    this.deploymentsActivity = this.deploymentsActivity.concat(resp.data.data);
                }
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    getReleaseUrl(releaseId) {
        const internalId = this.Ids.toInternalId(releaseId);
        return `#${this.ViewStorage.getView(internalId, `/releases/${internalId}`)}`;
    }

    getTaskUrl(releaseId, taskId) {
        const phaseTaskId = this.Ids.phaseTaskIdFrom(taskId);
        const internalId = this.Ids.toInternalId(phaseTaskId);
        return `${this.getReleaseUrl(releaseId)}?openTaskDetailsModal=${internalId}`;
    }

    getTaskType(deployment) {
        if (deployment.isPythonScriptTask) {
            return 'xlrelease.CustomScriptTask';
        }
        return deployment.taskType;
    }
}

export const boaDeploymentActivityDetailsComponent = {
    bindings: {
        resolve: '<',
        close: '&',
    },
    controller: BoaDeploymentActivityDetailsController,
    template
};

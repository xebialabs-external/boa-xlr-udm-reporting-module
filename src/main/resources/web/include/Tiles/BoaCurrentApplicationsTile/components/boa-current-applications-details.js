import './boa-current-applications-details.less';

const template = `
    <div class="modal-header">
        <h5 class="modal-title pull-left boa-current-applications-details-title">
            Deployed applications in the <xlr-date-range-label
                    class="xlr-tile-date-range-label"
                    time-frame="$ctrl.resolve.data.timeFrame"
                    from="$ctrl.resolve.data.dateFrom"
                    to="$ctrl.resolve.data.dateTo">
            </xlr-date-range-label>
        </h5>
        <button type="button" class="close pull-right" ng-click="$ctrl.close()"><i class="xl-icon close-icon"></i></button>
        <div class="clearfix"></div>
    </div>
    <div class="modal-body boa-current-applications-details-body">
        <div class="filters" data-ng-if="!$ctrl.isLoading">
            <div class="filter-group">
                <label for="">Environment</label>
                <div xl-widget-autocomplete
                     ng-model="$ctrl.selectedEnvironment"
                     showAllOnClick="true"
                     obj-label="title"
                     handlers="$ctrl.environmentFilterHandler"
                     select-mode="true"
                     options="{placeholder: 'Environment'}"
                     show-all-on-click="true"
                     open-on-click="true"
                ></div>
            </div>
        </div>
        <div class="boa-current-applications-details-data-wrapper">
            <div class="boa-current-applications-details-data" data-ng-if="!$ctrl.isLoading"
                data-ng-repeat="(environmentName, value) in $ctrl.filterCurrentApplications($ctrl.currentApplications)">
                <h5>
                    <i class="xl-icon environment-icon"></i>
                    <span>{{::environmentName}}</span>
                </h5>
                <table class="table table-curved">
                    <thead>
                        <tr>
                            <th>Component</th>
                            <th>Build Number</th>
                            <th>SPK-Environment</th>
                            <th>Deployer ID</th>
                            <th>Certification Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr ng-repeat="deployment in value">
                            <td>
                                <i class="xl-icon application-icon"></i>
                                <span class="mrm">{{::deployment.applicationName}}</span>
                            </td>
                            <td>
                                <i class="xl-icon package-icon"></i>
                                <span class="mrm">{{::deployment.version}}</span>
                            </td>
                            <td>
                                <i class="xl-icon environment-icon"></i>
                                <span class="mrm">{{::deployment.environmentName}}</span>
                            </td>
                            <td>
                                <deployment-owner task-owner="deployment.taskOwner" task-team="deployment.taskTeam"></deployment-owner>
                            </td>
                            <td>
                                {{::deployment.releaseTitle | date: "medium"}}
                            </td>
                            <td>{{::deployment.endDate | date: "medium"}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div ng-show="$ctrl.isLoading" class="spinner text-center">
            <img src="static/@project.version@/styles/img/big-ajax-loader.gif" alt="Loading..."/>
        </div>
    </div>
`;

class BoaCurrentApplicationsDetailsController {
    SELECT_ALL_OPTION = { title: 'All', searchFilter: '' };

    static $inject = ['DeploymentTileService', '$q'];

    constructor(DeploymentTileService, $q) {
        this.DeploymentTileService = DeploymentTileService;
        this.$q = $q;
        this.selectedEnvironment = undefined;
        this.environmentFilterHandler = {
            addCandidates: (metadata, options) => this.envAddCandidates(metadata, options),
        };
    }

    $onInit() {
        this.selectedEnvironment = this.SELECT_ALL_OPTION;
        this.fetchData(this.MAX_VALUE, 0);
    }

    fetchData(page, offset) {
        this.isLoading = true;
        this.DeploymentTileService.fetchTileData(this.resolve.data.tile.id)
            .then((resp) => {
                this.currentApplications = _.groupBy(resp.data.data, 'environmentName');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    envAddCandidates(metadata, options) {
        const environments = _(this.currentApplications)
            .keys()
            .map((title) => ({ title, searchFilter: title }))
            .value();
        return this.$q.resolve([this.SELECT_ALL_OPTION].concat(environments));
    }

    filterCurrentApplications(currentApplications) {
        if (angular.isUndefined(this.selectedEnvironment)) {
            this.selectedEnvironment = this.SELECT_ALL_OPTION;
        } else if (this.selectedEnvironment.title !== 'All') {
            return { [this.selectedEnvironment.searchFilter]: currentApplications[this.selectedEnvironment.searchFilter] };
        }
        return currentApplications;
    }
}

export const boaCurrentApplicationsDetailsComponent = {
    bindings: {
        resolve: '<',
        close: '&',
    },
    controller: BoaCurrentApplicationsDetailsController,
    template,
};
import {BoaDeploymentTileService} from './boa-deployment-tile-service';
import {APPLICATION_FILTER_TYPE, ENVIRONMENT_FILTER_TYPE, ENVIRONMENT_LABEL_FILTER_TYPE, ENVIRONMENT_STAGE_FILTER_TYPE} from "./boa-deployment-tile-constants";

angular.module('xlrelease').service('BoaDeploymentTileService', BoaDeploymentTileService);

angular.module('xlrelease').run([
    'CompositeFilterService',
    'BoaDeploymentTileService',
    (CompositeFilterService, BoaDeploymentTileService) => {
        CompositeFilterService.registerFilter(ENVIRONMENT_STAGE_FILTER_TYPE, {
            type: ENVIRONMENT_STAGE_FILTER_TYPE,
            title: 'Environment stage',
            operators: [{value: 'OR', title: 'matches'}],
            filterTag: true,
            property: 'environmentStageId',
            autocompleteCandidates: BoaDeploymentTileService.getAllEnvironmentStages.bind(BoaDeploymentTileService),
        });

        CompositeFilterService.registerFilter(ENVIRONMENT_LABEL_FILTER_TYPE, {
            type: ENVIRONMENT_LABEL_FILTER_TYPE,
            title: 'Environment label',
            operators: [{value: 'OR', title: 'matches'}],
            filterTag: true,
            property: 'environmentLabelId',
            autocompleteCandidates: BoaDeploymentTileService.getAllEnvironmentLabels.bind(BoaDeploymentTileService)
        });

        CompositeFilterService.registerFilter(ENVIRONMENT_FILTER_TYPE, {
            type: ENVIRONMENT_FILTER_TYPE,
            title: 'Environment',
            operators: [{value: 'OR', title: 'matches'}],
            filterTag: true,
            property: 'environmentId',
            autocompleteCandidates: BoaDeploymentTileService.getAllEnvironments.bind(BoaDeploymentTileService)
        });

        CompositeFilterService.registerFilter(APPLICATION_FILTER_TYPE, {
            type: APPLICATION_FILTER_TYPE,
            title: 'Application',
            operators: [{value: 'OR', title: 'matches'}],
            filterTag: true,
            property: 'applicationId',
            autocompleteCandidates: BoaDeploymentTileService.getAllApplications.bind(BoaDeploymentTileService)
        });
    },
]);
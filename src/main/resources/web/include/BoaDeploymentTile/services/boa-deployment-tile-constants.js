export const DATE_FILTER_TYPE = 'xlrelease.DateFilter';
export const FOLDER_FILTER_TYPE = 'xlrelease.FolderFilter';
export const ENVIRONMENT_STAGE_FILTER_TYPE = 'xlrelease.EnvironmentStageFilter';
export const ENVIRONMENT_LABEL_FILTER_TYPE = 'xlrelease.EnvironmentLabelFilter';
export const ENVIRONMENT_FILTER_TYPE = 'xlrelease.EnvironmentFilter';
export const APPLICATION_FILTER_TYPE = 'xlrelease.ApplicationFilter';

export const ENTITY_ID_PLACEHOLDER = "-1";

export const DEFAULT_TIME_PERIOD = 'LAST_SIX_MONTHS';

export const DEPLOYMENT_STATE_ALL = 'all';

export const DEPLOYMENT_STATE = {
    started: {
        value: 'started',
        className: 'label-active',
        label: 'Started'
    },
    failed: {
        value: 'failed',
        className: 'label-warning-failed',
        label: 'Failed'
    },
    retried: {
        value: 'retried',
        className: 'label-warning-failing',
        label: 'Retried'
    },
    skipped: {
        value: 'skipped',
        className: 'label-default',
        label: 'Skipped'
    },
    aborted: {
        value: 'aborted',
        className: 'label-default',
        label: 'Aborted'
    },
    successful: {
        value: 'completed',
        className: 'label-completed',
        label: 'Successful'
    }
};

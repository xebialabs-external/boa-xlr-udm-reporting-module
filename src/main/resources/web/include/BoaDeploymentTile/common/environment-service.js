import {httpDELETE, httpGET, httpPOST, httpPUT} from '../services/http';

export const createEnvironment = (environment) => {
    return httpPOST('api/v1/environments', environment);
};

export const loadEnvironment = (environmentId) => {
    return httpGET(`api/v1/environments/${environmentId}`)
        .then(response => response.data);
};

export const updateEnvironment = (environmentId, environment) => {
    return httpPUT(`api/v1/environments/${environmentId}`, environment);
};

export const searchEnvironments = ({title, stage}) => {
    return httpPOST('api/v1/environments/search', {title, stage})
        .then(response => response.data);
};

export const deleteEnvironment = (environmentId) => {
    return httpDELETE(`api/v1/environments/${environmentId}`);
};

export const getDeployableApplicationsForEnvironment = environmentId => {
    return httpGET(`api/v1/environments/${environmentId}/applications`)
        .then(response => response.data);
};

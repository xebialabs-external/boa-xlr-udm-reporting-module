import {httpDELETE, httpGET, httpPOST, httpPUT} from '../services/http';

export const searchApp = (title) => {
    return httpPOST('api/v1/applications/search', {title})
        .then(resp => resp.data);
};

export const createApp = (application) => {
    return httpPOST('api/v1/applications', application)
        .then(response => response.data);
};

export const getApp = (applicationId) => {
    return httpGET(`api/v1/applications/${applicationId}`)
        .then(response => response.data);
};

export const updateApp = (application) => {
    return httpPUT(`api/v1/applications/${application.id}`, application);
};

export const deleteApp = (applicationId) => {
    return httpDELETE(`api/v1/applications/${applicationId}`);
};

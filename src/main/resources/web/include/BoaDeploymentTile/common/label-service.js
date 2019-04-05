import {httpDELETE, httpGET, httpPOST, httpPUT} from '../services/http';

export const createLabel = (envLabel) => {
    return httpPOST('api/v1/environments/labels', envLabel);
};

export const searchLabels = (title) => {
    return httpPOST('api/v1/environments/labels/search', {title})
        .then(response => response.data);
};

export const getLabel = (envLabelId) => {
    return httpGET(`api/v1/environments/labels/${envLabelId}`)
        .then(response => response.data);
};

export const updateLabel = (envLabelId, envLabel) => {
    return httpPUT(`api/v1/environments/labels/${envLabelId}`, envLabel);
};

export const deleteLabel = (envLabelId) => {
    return httpDELETE(`api/v1/environments/labels/${envLabelId}`);
};

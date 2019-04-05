import {httpDELETE, httpGET, httpPOST, httpPUT} from '../services/http';

export const createStage = (stage) => {
    return httpPOST('api/v1/environments/stages', stage);
};

export const searchStages = (title) => {
    return httpPOST('api/v1/environments/stages/search', {title})
        .then(response => response.data);
};

export const getStage = (stageId) => {
    return httpGET(`api/v1/environments/stages/${stageId}`)
        .then(response => response.data);
};

export const updateStage = (stageId, stage) => {
    return httpPUT(`api/v1/environments/stages/${stageId}`, stage);
};

export const deleteStage = (stageId) => {
    return httpDELETE(`api/v1/environments/stages/${stageId}`);
};


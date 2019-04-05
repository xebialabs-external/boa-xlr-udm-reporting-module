import axios from "axios";

const instance = axios.create();

export const registerRequestInterceptor = requestInterceptor => {
    instance.interceptors.request.use(requestInterceptor, error => error);
};
export const registerResponseInterceptors = (successInterceptor, errorInterceptor) => {
    instance.interceptors.response.use(successInterceptor, errorInterceptor);
};

export const directHttpRequest = (method, url, config, headers) => {
    const requestObject = {
        ...config,
        headers,
        method,
        url
    };
    return instance.request(requestObject);
};

export const httpRequest = (method, url, config, accept = 'application/json') =>
    directHttpRequest(method, `${url}`, config, {
        'Accept': accept,
        'Accept-Type': accept,
        'X-HTTP-Auth-Override': 'true',
    });

export const httpCodes = {
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    VERSION_CHANGED: 410
};

export function httpGET(url) {
    return httpRequest('GET', url);
}

export function httpPOST(url, data) {
    return httpRequest('POST', url, {data});
}

export function httpPUT(url, data) {
    return httpRequest('PUT', url, {data});
}

export function httpDELETE(url, data) {
    return httpRequest('DELETE', url, {data});
}
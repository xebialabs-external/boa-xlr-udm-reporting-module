import findIndex from 'lodash/findIndex';

const existByField = (list, field, value) => {
    return findIndex(list, e => e[field].toLowerCase() === value.toLowerCase()) > -1;
};

const findById = (list, id, defaultField) => {
    return list.find(e => e.id === id) || {[defaultField]: ''};
};

export const itemAlreadyDefined = (list, selectedId, field, value) => {
  return existByField(list, field, value)
      && findById(list, selectedId, field)[field].toLowerCase() !== value.toLowerCase();
};

export const validateMaxLength = (inputText, maxLength) => {
    return inputText && inputText.length > maxLength;
};

export const createErrorMessage = (text) => ({show: false, text, type: 'ERROR'});

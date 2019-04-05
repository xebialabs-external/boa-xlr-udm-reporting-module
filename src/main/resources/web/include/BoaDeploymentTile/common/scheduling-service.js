import {httpDELETE, httpGET, httpPOST, httpPUT} from '../services/http';

export const searchReservations = (schedulerFilter) => {
    return httpPOST('api/v1/environments/reservations/search', schedulerFilter)
        .then(response => response.data);
};

export const createReservation = (reservation) => {
    return httpPOST('api/v1/environments/reservations', reservation);
};

export const updateReservation = (reservationId, reservation) => {
    return httpPUT(`api/v1/environments/reservations/${reservationId}`, reservation);
};

export const fetchReservation = (reservationId) => {
  return httpGET(`api/v1/environments/reservations/${reservationId}`)
      .then(response => response.data);
};

export const deleteReservation = (reservationId) => {
    return httpDELETE(`api/v1/environments/reservations/${reservationId}`);
};


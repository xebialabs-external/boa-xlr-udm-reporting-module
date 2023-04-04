import {searchEnvironments} from "../common/environment-service";
import {searchStages} from "../common/stage-service";
import {searchLabels} from "../common/label-service";
import {searchApp} from "../common/application-service";

export class BoaDeploymentTileService {
    static $inject = ['Backend', 'Ids'];

    constructor(Backend, Ids) {
        this.Backend = Backend;
        this.Ids = Ids;

        this.clearCachedPromises();
    }

    fetchTileData(tileId, tileProperties) {
        return this.Backend.get(`tiles/${tileId}/data`, { ...tileProperties, hideAlert: true });
    }

    getAllEnvironments(forceLoad) {
        if (forceLoad || !this._cachedEnvironmentsPromise) {
            this._cachedEnvironmentsPromise = searchEnvironments('')
                .then((response) =>
                    response
                        ? response.map((env) => ({
                              id: this.Ids.getName(env.id),
                              title: env.title,
                          }))
                        : [],
                )
                .catch((error) => {
                    /* eslint-disable no-console, angular/log */
                    console.warn(error);
                });
        }
        return this._cachedEnvironmentsPromise;
    }

    getAllEnvironmentStages(forceLoad) {
        if (forceLoad || !this._cachedEnvironmentStagesPromise) {
            this._cachedEnvironmentStagesPromise = searchStages('')
                .then((response) =>
                    response
                        ? response.map((env) => ({
                              id: this.Ids.getName(env.id),
                              title: env.title,
                          }))
                        : [],
                )
                .catch((error) => {
                    /* eslint-disable no-console, angular/log */
                    console.warn(error);
                });
        }
        return this._cachedEnvironmentStagesPromise;
    }

    getAllEnvironmentLabels(forceLoad) {
        if (forceLoad || !this._cachedEnvironmentLabelsPromise) {
            this._cachedEnvironmentLabelsPromise = searchLabels('')
                .then((response) =>
                    response
                        ? response.map((env) => ({
                              id: this.Ids.getName(env.id),
                              title: env.title,
                          }))
                        : [],
                )
                .catch((error) => {
                    /* eslint-disable no-console, angular/log */
                    console.warn(error);
                });
        }
        return this._cachedEnvironmentLabelsPromise;
    }

    getAllApplications(forceLoad) {
        if (forceLoad || !this._cachedApplicationsPromise) {
            this._cachedApplicationsPromise = searchApp("")
                .then(response =>
                    response
                        ? response.map(env => ({
                            id: this.Ids.getName(env.id),
                            title: env.title,
                        }))
                        : [],
                )
                .catch(error => {
                    /* eslint-disable no-console, angular/log */
                    console.warn(error);
                });
        }
        return this._cachedApplicationsPromise;
    }

    clearCachedPromises() {
        this._cachedEnvironmentStagesPromise = null;
        this._cachedEnvironmentsPromise = null;
        this._cachedEnvironmentLabelsPromise = null;
        this._cachedApplicationsPromise = null;
    }
}
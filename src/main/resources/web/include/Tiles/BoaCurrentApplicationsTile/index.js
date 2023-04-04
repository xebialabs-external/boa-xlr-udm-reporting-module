import angular from 'angular';
import './boa-current-applications-tile.less';
import {boaCurrentApplicationsTile} from "./boa-current-applications-tile";
import {boaCurrentApplicationsDetailsComponent} from "./components/boa-current-applications-details";

angular
    .module('xlrelease')
    .component('boaCurrentApplicationsTile', boaCurrentApplicationsTile)
    .component('boaCurrentApplicationsDetails', boaCurrentApplicationsDetailsComponent);
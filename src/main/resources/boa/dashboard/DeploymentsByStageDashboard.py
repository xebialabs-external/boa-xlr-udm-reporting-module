#
# Copyright 2019 XEBIALABS
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
global dashboard, environmentStageApi

from com.xebialabs.xlrelease.plugins.dashboard.builder import TileBuilder

from com.xebialabs.xlrelease.api.v1.filter import EnvironmentStageFilters
from com.xebialabs.xlrelease.udm.reporting.filters import EnvironmentStageFilter

from com.xebialabs.xlrelease.repository import Ids

stages = environmentStageApi.search(EnvironmentStageFilters())

def create_tiles(stage, column):
    filters = [EnvironmentStageFilter(Ids.getName(stage.id))]
    filters.extend(dashboard.getProperty('filters'))

    label = (TileBuilder
        .newTile()
        .withType('xlrelease.PlaceholderTile')
        .withWidth(1)
        .withHeight(1)
        .withCol(column)
        .withRow(0)
        .withProperty('content', stage.title)
        .build())

    currentApplications = (TileBuilder
        .newTile()
        .withType('boa.CurrentApplicationsTile')
        .withWidth(1)
        .withHeight(1)
        .withCol(column)
        .withRow(1)
        .withTitle('BOA Current applications')
        .withProperty('filters', filters)
        .build())

    activity = (TileBuilder
        .newTile()
        .withType('deployment.DeploymentsActivityTile')
        .withWidth(1)
        .withHeight(2)
        .withCol(column)
        .withRow(2)
        .withTitle('Activity')
        .withProperty('filters', filters)
        .build())

    deployments = (TileBuilder
        .newTile()
        .withType('deployment.TotalDeploymentsTile')
        .withWidth(1)
        .withHeight(1)
        .withCol(column)
        .withRow(4)
        .withTitle('Total deployments')
        .withProperty('filters', filters)
        .build())

    deploymentsDistribution = (TileBuilder
        .newTile()
        .withType('deployment.DeploymentsDistributionTile')
        .withWidth(1)
        .withHeight(1)
        .withCol(column)
        .withRow(5)
        .withTitle('Deployments')
        .withProperty('filters', filters)
        .build())

    deploymentSuccessRate = (TileBuilder
        .newTile()
        .withType('deployment.DeploymentsSuccessRateTile')
        .withWidth(1)
        .withHeight(1)
        .withCol(column)
        .withRow(6)
        .withTitle('Deployment success rate')
        .withProperty('filters', filters)
        .build())

    return [label, currentApplications, activity, deployments, deploymentsDistribution, deploymentSuccessRate]

dashboard.setColumns(0)

for stageId in dashboard.getProperty('stageIds'):
    stage = next((x for x in stages if Ids.getName(x.id) == Ids.getName(stageId)), None)
    if stage:
        dashboard.getTiles().addAll(create_tiles(stage, dashboard.getColumns()))
        dashboard.setColumns(dashboard.getColumns() + 1)
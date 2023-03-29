global dashboard, environmentStageApi

from com.xebialabs.xlrelease.plugins.dashboard.builder import TileBuilder

from com.xebialabs.xlrelease.api.v1.filter import EnvironmentStageFilters
from com.xebialabs.xlrelease.domain.udm.reporting.filters import EnvironmentStageFilter

from com.xebialabs.xlrelease.repository import Ids

stages = environmentStageApi.search(EnvironmentStageFilters())

def create_tiles(stage, column):
    f = EnvironmentStageFilter(Ids.getName(stage.id))
    # setting it to -1 to be consistent with other filters
    f.setId('-1')
    filters = [f]
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
        .withType('boa.DeploymentsActivityTile')
        .withWidth(1)
        .withHeight(2)
        .withCol(column)
        .withRow(2)
        .withTitle('BOA Activity')
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
        .withType('boa.DeploymentsDistributionTile')
        .withWidth(1)
        .withHeight(1)
        .withCol(column)
        .withRow(5)
        .withTitle('BOA Deployments')
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
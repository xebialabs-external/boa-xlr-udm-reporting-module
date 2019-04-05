global applicationContext, tile

from com.xebialabs.xlrelease.udm.reporting import DeploymentStatus

total_deployments_query = applicationContext.getBean('boaTotalDeploymentsQuery')
result = total_deployments_query.execute(tile)

if deploymentStatus == DeploymentStatus.COMPLETED :
    data = result.completed()
elif deploymentStatus == DeploymentStatus.FAILED :
    data = result.failed()
else:
    data = result.completed() + result.failed()
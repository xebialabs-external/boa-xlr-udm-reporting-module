global applicationContext, tile, pageSize, offset

deployment_activity_query = applicationContext.getBean('boaDeploymentsActivityQuery')

params = {'pageSize': int(pageSize), 'offset': int(offset)}
if 'deploymentState' in locals():
    params['action'] = deploymentState

data = deployment_activity_query.execute(tile, params)
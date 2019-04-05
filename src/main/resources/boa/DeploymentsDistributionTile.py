global applicationContext, tile, pageSize, offset

if 'deploymentState' in locals():
    deployment_activity_query = applicationContext.getBean('boaDeploymentsActivityQuery')
    params = {'pageSize': int(pageSize), 'offset': int(offset), 'action': deploymentState}
    data = deployment_activity_query.execute(tile, params)
else:
    total_deployments_query = applicationContext.getBean('boaTotalDeploymentsQuery')
    result = total_deployments_query.execute(tile)

    completed = result.completed()
    failed = result.failed()

    if completed + failed == 0:
        data = None
    else:
        data = {'successful': completed,'failed': failed}
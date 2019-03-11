package com.xebialabs.xlrelease.udm.reporting.repository.sql.persistence

import com.xebialabs.xlrelease.repository.sql.persistence.Table

object DeploymentSchema {

  val COLUMN_LENGTH_TITLE: Int = 255

  object DEPLOYMENTS extends Table("DEPLOYMENTS") {
    val DEPLOYMENT_ID = "deploymentId"
    val ENVIRONMENT_ID = "environmentId"
    val ENVIRONMENT_NAME = "environmentName"
    val APPLICATION_ID = "applicationId"
    val APPLICATION_NAME = "applicationName"
    val VERSION = "version"
    val STATUS = "status"
    val START_DATE = "startDate"
    val END_DATE = "endDate"
    val DURATION = "duration"
    val RELEASE_ID = "releaseId"
    val RELEASE_TITLE = "releaseTitle"
    val TASK_ID = "taskId"
    val TASK_TITLE = "taskTitle"
    val TASK_TYPE = "taskType"
    val SOURCE_ID = "sourceId"
    val TASK_OWNER = "taskOwner"
    val TASK_TEAM = "taskTeam"
    val RELEASE_OWNER = "releaseOwner"
    val IS_AUTOMATED = "isAutomated"
    val FAILURES_COUNT = "failuresCount"
  }

  object DEPLOYMENT_HISTORY extends Table("DEPLOYMENT_HISTORY") {
    val DEPLOYMENT_ID = "deploymentId"
    val TASK_OWNER = "taskOwner"
    val TASK_TEAM = "taskTeam"
    val OLD_STATUS = "oldStatus"
    val NEW_STATUS = "newStatus"
    val DEPLOYMENT_ACTION = "deploymentAction"
    val CHANGE_DATE = "changeDate"
  }

}

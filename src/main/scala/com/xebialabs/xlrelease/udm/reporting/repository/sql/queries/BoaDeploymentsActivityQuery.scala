package com.xebialabs.xlrelease.udm.reporting.repository.sql.queries

import java.sql.ResultSet
import java.util.{Date, Map => JMap}

import com.hierynomus.utils.Strings
import com.xebialabs.deployit.plugin.api.reflect.Type
import com.xebialabs.xlrelease.db.sql.SqlBuilder.Dialect
import com.xebialabs.xlrelease.domain.PythonScriptDefinition
import com.xebialabs.xlrelease.environments.repository.sql.persistence.EnvironmentPersistence
import com.xebialabs.xlrelease.plugins.dashboard.domain.Tile
import com.xebialabs.xlrelease.reports.filters.ReportFilter
import com.xebialabs.xlrelease.udm.reporting.DeploymentAction
import com.xebialabs.xlrelease.udm.reporting.repository.sql.DeploymentsSqlBuilder
import com.xebialabs.xlrelease.udm.reporting.repository.sql.persistence.DeploymentSchema.{DEPLOYMENTS, DEPLOYMENT_HISTORY}
import org.springframework.beans.factory.annotation.{Autowired, Qualifier}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import scala.beans.BeanProperty
import scala.jdk.CollectionConverters._

@Component
class BoaDeploymentsActivityQuery @Autowired()(val environmentPersistence: EnvironmentPersistence,
                                            @Qualifier("reportingSqlDialect") implicit val dialect: Dialect,
                                            @Qualifier("reportingJdbcTemplate") implicit val jdbcTemplate: JdbcTemplate) extends DeploymentQuery {

  private val TILE_QUERY =
    s""" SELECT deployments.${DEPLOYMENTS.DEPLOYMENT_ID},
        | history.${DEPLOYMENT_HISTORY.CHANGE_DATE},
        | history.${DEPLOYMENT_HISTORY.DEPLOYMENT_ACTION},
        | deployments.${DEPLOYMENTS.TASK_OWNER},
        | deployments.${DEPLOYMENTS.TASK_TEAM},
        | deployments.${DEPLOYMENTS.RELEASE_ID},
        | deployments.${DEPLOYMENTS.RELEASE_TITLE},
        | deployments.${DEPLOYMENTS.TASK_ID},
        | deployments.${DEPLOYMENTS.TASK_TITLE},
        | deployments.${DEPLOYMENTS.TASK_TYPE},
        | deployments.${DEPLOYMENTS.VERSION},
        | deployments.${DEPLOYMENTS.ENVIRONMENT_NAME},
        | deployments.${DEPLOYMENTS.APPLICATION_NAME}
        |FROM ${DEPLOYMENTS.TABLE} deployments
        |LEFT JOIN ${DEPLOYMENT_HISTORY.TABLE} history ON history.${DEPLOYMENTS.DEPLOYMENT_ID} = deployments.${DEPLOYMENTS.DEPLOYMENT_ID}""".stripMargin

  override def execute(tile: Tile, additionalParameters: JMap[String, Any]): AnyRef = {
    val filters: java.util.List[ReportFilter] = tile.getProperty("filters")
    val environmentIds = getEnvironmentIds(filters.asScala.toSeq)

    if (environmentIds.isEmpty) {
      Seq.empty.asJava
    } else {
      val builder = new DeploymentsSqlBuilder()
        .select(TILE_QUERY)
        .withFilters(filters.asScala.toSeq)
        .withEnvironmentIds(environmentIds.get)
        .limitAndOffset(additionalParameters.getOrDefault("pageSize", 100).asInstanceOf[Int], additionalParameters.getOrDefault("offset", 0L).asInstanceOf[Int])
        .orderBy(s"history.${DEPLOYMENT_HISTORY.CHANGE_DATE} DESC")

      if (additionalParameters.containsKey("action") && Strings.isNotBlank(additionalParameters.get("action").toString)) {
        builder.withCondition(s"${DEPLOYMENT_HISTORY.DEPLOYMENT_ACTION} = ?", Seq[AnyRef](DeploymentAction.find(additionalParameters.get("action").toString).value()).asJava)
      }

      val (sql, params) = builder.build()
      val results = jdbcTemplate.query[DeploymentActivityDto](sql, params.toArray, (rs: ResultSet, _: Int) => {
        val activity = new DeploymentActivityDto
        activity.state = rs.getString(DEPLOYMENT_HISTORY.DEPLOYMENT_ACTION)
        activity.taskOwner = rs.getString(DEPLOYMENTS.TASK_OWNER)
        activity.taskTeam = rs.getString(DEPLOYMENTS.TASK_TEAM)
        activity.applicationName = rs.getString(DEPLOYMENTS.APPLICATION_NAME)
        activity.environmentName = rs.getString(DEPLOYMENTS.ENVIRONMENT_NAME)
        activity.version = rs.getString(DEPLOYMENTS.VERSION)
        activity.changeDate = rs.getTimestamp(DEPLOYMENT_HISTORY.CHANGE_DATE)
        activity.releaseId = rs.getString(DEPLOYMENTS.RELEASE_ID)
        activity.releaseTitle = rs.getString(DEPLOYMENTS.RELEASE_TITLE)
        activity.taskId = rs.getString(DEPLOYMENTS.TASK_ID)
        activity.taskTitle = rs.getString(DEPLOYMENTS.TASK_TITLE)
        activity.taskType = rs.getString(DEPLOYMENTS.TASK_TYPE)

        val taskType = Type.valueOf(activity.taskType)
        if (PythonScriptDefinition.isScriptDefinition(taskType)) {
          activity.isPythonScriptTask = true
          val iconLocation = taskType.getDescriptor.getPropertyDescriptor("iconLocation")
          if (iconLocation != null) {
            activity.customIconLocation = iconLocation.getDefaultValue.toString
          }
        }

        activity
      })
      results
    }
  }

  class DeploymentActivityDto {
    @BeanProperty
    var taskOwner: String = ""
    @BeanProperty
    var taskTeam: String = ""
    @BeanProperty
    var isPythonScriptTask: Boolean = false
    @BeanProperty
    var applicationName: String = _
    @BeanProperty
    var environmentName: String = _
    @BeanProperty
    var version: String = _
    @BeanProperty
    var releaseId: String = _
    @BeanProperty
    var taskId: String = _
    @BeanProperty
    var releaseTitle: String = _
    @BeanProperty
    var taskTitle: String = _
    @BeanProperty
    var taskType: String = _
    @BeanProperty
    var customIconLocation: String = _
    @BeanProperty
    var state: String = _
    @BeanProperty
    var changeDate: Date = _
  }

}


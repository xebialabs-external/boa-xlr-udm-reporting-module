package com.xebialabs.xlrelease.udm.reporting.repository.sql.queries

import java.util.{Map => JMap}

import com.xebialabs.xlrelease.db.sql.SqlBuilder.Dialect
import com.xebialabs.xlrelease.environments.repository.sql.persistence.EnvironmentPersistence
import com.xebialabs.xlrelease.plugins.dashboard.domain.Tile
import com.xebialabs.xlrelease.reports.filters.ReportFilter
import com.xebialabs.xlrelease.udm.reporting.DeploymentStatus
import com.xebialabs.xlrelease.udm.reporting.repository.sql.DeploymentsSqlBuilder
import com.xebialabs.xlrelease.udm.reporting.repository.sql.persistence.DeploymentPersistence
import com.xebialabs.xlrelease.udm.reporting.repository.sql.persistence.DeploymentSchema.DEPLOYMENTS
import org.springframework.beans.factory.annotation.{Autowired, Qualifier}
import org.springframework.stereotype.Component

import scala.collection.JavaConverters._

@Component
class BoaCurrentApplicationsQuery @Autowired()(val environmentPersistence: EnvironmentPersistence,
                                               val deploymentPersistence: DeploymentPersistence,
                                               @Qualifier("reportingSqlDialect") implicit val dialect: Dialect) extends DeploymentQuery {
  // TODO: what to show under User in the UI
  // TODO: is this subselect required?
  private val TILE_QUERY =
  s"""SELECT deployments.${DEPLOYMENTS.DEPLOYMENT_ID},
     |deployments.${DEPLOYMENTS.ENVIRONMENT_NAME},
     |deployments.${DEPLOYMENTS.APPLICATION_NAME},
     |deployments.${DEPLOYMENTS.VERSION},
     |deployments.${DEPLOYMENTS.TASK_OWNER},
     |deployments.${DEPLOYMENTS.TASK_TEAM},
     |deployments.${DEPLOYMENTS.END_DATE},
     |deployments.${DEPLOYMENTS.RELEASE_ID}
     |FROM (
     |  SELECT depl1.*
     |  FROM ${DEPLOYMENTS.TABLE} depl1
     |  LEFT JOIN ${DEPLOYMENTS.TABLE} depl2 ON (
     |    depl1.${DEPLOYMENTS.APPLICATION_ID} = depl2.${DEPLOYMENTS.APPLICATION_ID}
     |    AND depl1.${DEPLOYMENTS.ENVIRONMENT_ID} = depl2.${DEPLOYMENTS.ENVIRONMENT_ID}
     |    AND depl1.${DEPLOYMENTS.END_DATE} < depl2.${DEPLOYMENTS.END_DATE}
     |    AND depl2.${DEPLOYMENTS.STATUS} = '${DeploymentStatus.COMPLETED.value()}'
     |  )
     |  WHERE depl2.${DEPLOYMENTS.DEPLOYMENT_ID} IS NULL
     |  AND depl1.${DEPLOYMENTS.STATUS} = '${DeploymentStatus.COMPLETED.value()}'
     |) deployments""".stripMargin

  override def execute(tile: Tile, additionalParameters: JMap[String, Any]): AnyRef = {
    val filters: java.util.List[ReportFilter] = tile.getProperty("filters")
    val environmentIds = getEnvironmentIds(filters.asScala)

    if (environmentIds.isEmpty) {
      Seq.empty.asJava
    } else {
      val query = new DeploymentsSqlBuilder()
        .select(TILE_QUERY)
        .withFilters(filters.asScala)
        .withEnvironmentIds(environmentIds.get)
        .orderBy(s"${DEPLOYMENTS.END_DATE} DESC")
        .build()
      deploymentPersistence.findByQuery(query).asJava
    }
  }

}


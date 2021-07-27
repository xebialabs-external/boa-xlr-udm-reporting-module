package com.xebialabs.xlrelease.udm.reporting.repository.sql.queries

import java.sql.ResultSet
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
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

import scala.jdk.CollectionConverters._

@Component
class BoaTotalDeploymentsQuery @Autowired()(val environmentPersistence: EnvironmentPersistence,
                                         val deploymentPersistence: DeploymentPersistence,
                                         @Qualifier("reportingJdbcTemplate") implicit val jdbcTemplate: JdbcTemplate,
                                         @Qualifier("reportingSqlDialect") implicit val dialect: Dialect) extends DeploymentQuery {
  private val TILE_QUERY =
    s"""SELECT SUM(CASE WHEN ${DEPLOYMENTS.STATUS} = '${DeploymentStatus.COMPLETED.value()}' THEN 1 ELSE 0 END) AS completed,
        | SUM(${DEPLOYMENTS.FAILURES_COUNT}) AS failed
        |FROM ${DEPLOYMENTS.TABLE}""".stripMargin

  override def execute(tile: Tile, additionalParameters: JMap[String, Any]): AnyRef = {
    val filters: java.util.List[ReportFilter] = tile.getProperty("filters")
    val environmentIds = getEnvironmentIds(filters.asScala.toSeq)

    if (environmentIds.isEmpty) {
      DeploymentCount(0, 0)
    } else {
      val (sql, params) = new DeploymentsSqlBuilder()
        .select(TILE_QUERY)
        .withFilters(filters.asScala.toSeq)
        .withEnvironmentIds(environmentIds.get)
        .build()
      jdbcTemplate.queryForObject(sql, params.toArray, (rs: ResultSet, _: Int) => DeploymentCount(rs.getInt("completed"), rs.getInt("failed")))
    }
  }

  case class DeploymentCount(completed: Int, failed: Int)

}





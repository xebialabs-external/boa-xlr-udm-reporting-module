package com.xebialabs.xlrelease.udm.reporting.repository.sql.persistence

import java.sql.ResultSet
import java.util.Date

import com.xebialabs.xlrelease.db.sql.SqlBuilder.Dialect
import com.xebialabs.xlrelease.db.sql.SqlWithParameters
import com.xebialabs.xlrelease.repository.Ids.getName
import com.xebialabs.xlrelease.repository.sql.persistence.CiId.{CiId, RichCiId}
import com.xebialabs.xlrelease.repository.sql.persistence.PersistenceSupport
import com.xebialabs.xlrelease.repository.sql.persistence.Utils.{RichStringAsTruncatable, params}
import com.xebialabs.xlrelease.spring.configuration.XlrProfiles
import com.xebialabs.xlrelease.udm.reporting.repository.sql.persistence.DeploymentSchema.{COLUMN_LENGTH_TITLE, DEPLOYMENT_HISTORY}
import com.xebialabs.xlrelease.udm.reporting.{DeploymentHistory, DeploymentStatus}
import org.springframework.beans.factory.annotation.{Autowired, Qualifier}
import org.springframework.context.annotation.Profile
import org.springframework.jdbc.core.{JdbcTemplate, RowMapper}
import org.springframework.stereotype.Repository

import scala.collection.JavaConverters._
import scala.util.Try

@Profile(Array(XlrProfiles.SQL))
@Repository
class DeploymentHistoryPersistence @Autowired()(implicit @Qualifier("reportingJdbcTemplate") val jdbcTemplate: JdbcTemplate,
                                                @Qualifier("reportingSqlDialect") implicit val dialect: Dialect)
  extends PersistenceSupport {
  private val STMT_INSERT_DEPLOYMENT_HISTORY =
    s"""|INSERT INTO ${DEPLOYMENT_HISTORY.TABLE}
        |   ( ${DEPLOYMENT_HISTORY.DEPLOYMENT_ID}
        |   , ${DEPLOYMENT_HISTORY.OLD_STATUS}
        |   , ${DEPLOYMENT_HISTORY.NEW_STATUS}
        |   , ${DEPLOYMENT_HISTORY.CHANGE_DATE}
        |   , ${DEPLOYMENT_HISTORY.DEPLOYMENT_ACTION}
        |   , ${DEPLOYMENT_HISTORY.TASK_OWNER}
        |   , ${DEPLOYMENT_HISTORY.TASK_TEAM}
        |   )
        | VALUES
        |   ( :deploymentId
        |   , :oldStatus
        |   , :newStatus
        |   , :changeDate
        |   , :action
        |   , :taskOwner
        |   , :taskTeam
        |   )
        """.stripMargin

  def insert(history: DeploymentHistory): Unit = {
    sqlInsert(STMT_INSERT_DEPLOYMENT_HISTORY, params(
      "deploymentId" -> getName(history.getDeploymentId.normalized),
      "oldStatus" -> Option(history.getOldStatus).map(_.value()).orNull,
      "newStatus" -> history.getNewStatus.value(),
      "changeDate" -> history.getChangeDate,
      "action" -> history.getAction.value(),
      "taskOwner" -> history.getTaskOwner.truncate(COLUMN_LENGTH_TITLE),
      "taskTeam" -> history.getTaskTeam.truncate(COLUMN_LENGTH_TITLE)
    ))
  }

  private val STMT_DELETE_DEPLOYMENT_HISTORY_BY_ID =
    s"""|DELETE FROM ${DEPLOYMENT_HISTORY.TABLE}
        | WHERE ${DEPLOYMENT_HISTORY.DEPLOYMENT_ID} = :deploymentId""".stripMargin

  def delete(deploymentId: CiId): Unit = sqlExec(STMT_DELETE_DEPLOYMENT_HISTORY_BY_ID,
    params("deploymentId" -> getName(deploymentId.normalized)), ps => Try(ps.execute()))

  private val STMT_FIND_DASHBOARD_HISTORY_BY_ID =
    s"""|SELECT deplHist.*
        | FROM ${DEPLOYMENT_HISTORY.TABLE} deplHist
        | WHERE deplHist.${DEPLOYMENT_HISTORY.DEPLOYMENT_ID} = ?
        | ORDER BY deplHist.${DEPLOYMENT_HISTORY.CHANGE_DATE} ASC""".stripMargin

  def findById(deploymentId: CiId): Seq[DeploymentHistory] =
    findByQuery((STMT_FIND_DASHBOARD_HISTORY_BY_ID, Seq(getName(deploymentId.normalized))))

  def findByQuery(sqlWithParameters: SqlWithParameters): Seq[DeploymentHistory] = {
    val (sql, params) = sqlWithParameters
    jdbcTemplate.query[DeploymentHistory](sql, params.toArray, deploymentHistoryMapper).asScala
  }

  private val deploymentHistoryMapper: RowMapper[DeploymentHistory] = (rs: ResultSet, _: Int) => {
    val deploymentHistory = new DeploymentHistory
    deploymentHistory.setDeploymentId(rs.getString(DEPLOYMENT_HISTORY.DEPLOYMENT_ID))
    deploymentHistory.setOldStatus(DeploymentStatus.find(rs.getString(DEPLOYMENT_HISTORY.OLD_STATUS)))
    deploymentHistory.setNewStatus(DeploymentStatus.find(rs.getString(DEPLOYMENT_HISTORY.NEW_STATUS)))
    deploymentHistory.setChangeDate(Option(rs.getTimestamp(DEPLOYMENT_HISTORY.CHANGE_DATE)).map(ts => new Date(ts.getTime)).orNull)
    deploymentHistory.setTaskOwner(rs.getString(DEPLOYMENT_HISTORY.TASK_OWNER))
    deploymentHistory.setTaskTeam(rs.getString(DEPLOYMENT_HISTORY.TASK_TEAM))
    deploymentHistory
  }
}

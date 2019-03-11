package com.xebialabs.xlrelease.udm.reporting.repository.sql.persistence

import java.sql.ResultSet
import java.util.Date

import com.xebialabs.xlrelease.db.ArchivedReleases.shortenId
import com.xebialabs.xlrelease.db.sql.SqlBuilder.Dialect
import com.xebialabs.xlrelease.db.sql.SqlWithParameters
import com.xebialabs.xlrelease.repository.Ids.{getFolderlessId, getName, releaseIdFrom}
import com.xebialabs.xlrelease.repository.sql.persistence.CiId.{CiId, RichCiId}
import com.xebialabs.xlrelease.repository.sql.persistence.PersistenceSupport
import com.xebialabs.xlrelease.repository.sql.persistence.Utils.{RichStringAsTruncatable, params}
import com.xebialabs.xlrelease.spring.configuration.XlrProfiles
import com.xebialabs.xlrelease.udm.reporting.repository.sql.persistence.DeploymentSchema.{COLUMN_LENGTH_TITLE, DEPLOYMENTS}
import com.xebialabs.xlrelease.udm.reporting.{Deployment, DeploymentStatus}
import org.springframework.beans.factory.annotation.{Autowired, Qualifier}
import org.springframework.context.annotation.Profile
import org.springframework.dao.DuplicateKeyException
import org.springframework.jdbc.core.{JdbcTemplate, RowMapper}
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Isolation.READ_COMMITTED
import org.springframework.transaction.annotation.Propagation.REQUIRED
import org.springframework.transaction.annotation.Transactional

import scala.collection.JavaConverters._
import scala.util.Try

@Profile(Array(XlrProfiles.SQL))
@Repository
@Transactional(value = "reportingTransactionManager", propagation = REQUIRED, isolation = READ_COMMITTED, rollbackFor = Array(classOf[Throwable]))
class DeploymentPersistence @Autowired()(implicit @Qualifier("reportingJdbcTemplate") val jdbcTemplate: JdbcTemplate,
                                         @Qualifier("reportingSqlDialect") implicit val dialect: Dialect)
  extends PersistenceSupport {

  private val STMT_INSERT_DEPLOYMENT =
    s"""|INSERT INTO ${DEPLOYMENTS.TABLE}
        |   ( ${DEPLOYMENTS.DEPLOYMENT_ID}
        |   , ${DEPLOYMENTS.APPLICATION_ID}
        |   , ${DEPLOYMENTS.ENVIRONMENT_ID}
        |   , ${DEPLOYMENTS.APPLICATION_NAME}
        |   , ${DEPLOYMENTS.ENVIRONMENT_NAME}
        |   , ${DEPLOYMENTS.VERSION}
        |   , ${DEPLOYMENTS.STATUS}
        |   , ${DEPLOYMENTS.START_DATE}
        |   , ${DEPLOYMENTS.END_DATE}
        |   , ${DEPLOYMENTS.DURATION}
        |   , ${DEPLOYMENTS.RELEASE_ID}
        |   , ${DEPLOYMENTS.RELEASE_TITLE}
        |   , ${DEPLOYMENTS.TASK_ID}
        |   , ${DEPLOYMENTS.TASK_TITLE}
        |   , ${DEPLOYMENTS.TASK_TYPE}
        |   , ${DEPLOYMENTS.SOURCE_ID}
        |   , ${DEPLOYMENTS.TASK_OWNER}
        |   , ${DEPLOYMENTS.TASK_TEAM}
        |   , ${DEPLOYMENTS.RELEASE_OWNER}
        |   , ${DEPLOYMENTS.IS_AUTOMATED}
        |   , ${DEPLOYMENTS.FAILURES_COUNT}
        |   )
        | VALUES
        |   ( :deploymentId
        |   , :applicationId
        |   , :environmentId
        |   , :applicationName
        |   , :environmentName
        |   , :version
        |   , :status
        |   , :startDate
        |   , :endDate
        |   , :duration
        |   , :releaseId
        |   , :releaseTitle
        |   , :taskId
        |   , :taskTitle
        |   , :taskType
        |   , :sourceId
        |   , :taskOwner
        |   , :taskTeam
        |   , :releaseOwner
        |   , :isAutomated
        |   , :failuresCount
        |   )
        """.stripMargin

  def insert(deployment: Deployment): Unit = {
    try {
      sqlInsert(STMT_INSERT_DEPLOYMENT, params(
        "deploymentId" -> getName(deployment.getDeploymentId.normalized),
        "applicationId" -> getName(deployment.getApplicationId),
        "environmentId" -> getName(deployment.getEnvironmentId),
        "applicationName" -> deployment.getApplicationName.truncate(COLUMN_LENGTH_TITLE),
        "environmentName" -> deployment.getEnvironmentName.truncate(COLUMN_LENGTH_TITLE),
        "version" -> deployment.getVersion,
        "status" -> deployment.getStatus.value(),
        "startDate" -> deployment.getStartDate,
        "endDate" -> deployment.getEndDate,
        "duration" -> deployment.getDuration,
        "releaseId" -> shortenId(deployment.getReleaseId),
        "releaseTitle" -> deployment.getReleaseTitle.truncate(COLUMN_LENGTH_TITLE),
        "taskId" -> getFolderlessId(deployment.getTaskId),
        "taskTitle" -> deployment.getTaskTitle.truncate(COLUMN_LENGTH_TITLE),
        "taskType" -> deployment.getTaskType,
        "sourceId" -> Option(deployment.getSourceId).map(getName).orNull,
        "taskOwner" -> deployment.getTaskOwner.truncate(COLUMN_LENGTH_TITLE),
        "taskTeam" -> deployment.getTaskTeam.truncate(COLUMN_LENGTH_TITLE),
        "releaseOwner" -> deployment.getReleaseOwner.truncate(COLUMN_LENGTH_TITLE),
        "isAutomated" -> (if (deployment.isAutomated) 1 else 0),
        "failuresCount" -> deployment.getFailuresCount
      ))
    } catch {
      case ex: DuplicateKeyException => throw new IllegalArgumentException(s"Deployment with ID '${deployment.getDeploymentId}' already exists", ex)
    }
  }

  private val STMT_UPDATE_DEPLOYMENT =
    s"""|UPDATE ${DEPLOYMENTS.TABLE}
        | SET
        | ${DEPLOYMENTS.APPLICATION_ID} = :applicationId,
        | ${DEPLOYMENTS.ENVIRONMENT_ID} = :environmentId,
        | ${DEPLOYMENTS.APPLICATION_NAME} = :applicationName,
        | ${DEPLOYMENTS.ENVIRONMENT_NAME} = :environmentName,
        | ${DEPLOYMENTS.VERSION} = :version,
        | ${DEPLOYMENTS.STATUS} = :status,
        | ${DEPLOYMENTS.START_DATE} = :startDate,
        | ${DEPLOYMENTS.END_DATE} = :endDate,
        | ${DEPLOYMENTS.DURATION} = :duration,
        | ${DEPLOYMENTS.RELEASE_ID} = :releaseId,
        | ${DEPLOYMENTS.RELEASE_TITLE} = :releaseTitle,
        | ${DEPLOYMENTS.TASK_ID} = :taskId,
        | ${DEPLOYMENTS.TASK_TITLE} = :taskTitle,
        | ${DEPLOYMENTS.TASK_TYPE} = :taskType,
        | ${DEPLOYMENTS.SOURCE_ID} = :sourceId,
        | ${DEPLOYMENTS.TASK_OWNER} = :taskOwner,
        | ${DEPLOYMENTS.TASK_TEAM} = :taskTeam,
        | ${DEPLOYMENTS.RELEASE_OWNER} = :releaseOwner,
        | ${DEPLOYMENTS.IS_AUTOMATED} = :isAutomated,
        | ${DEPLOYMENTS.FAILURES_COUNT} = :failuresCount
        | WHERE
        |  ${DEPLOYMENTS.DEPLOYMENT_ID} = :deploymentId
        """.stripMargin

  def update(deployment: Deployment): Unit = {
    sqlExec(STMT_UPDATE_DEPLOYMENT, params(
      "deploymentId" -> getName(deployment.getDeploymentId),
      "applicationId" -> getName(deployment.getApplicationId),
      "environmentId" -> getName(deployment.getEnvironmentId),
      "applicationName" -> deployment.getApplicationName.truncate(COLUMN_LENGTH_TITLE),
      "environmentName" -> deployment.getEnvironmentName.truncate(COLUMN_LENGTH_TITLE),
      "version" -> deployment.getVersion,
      "status" -> deployment.getStatus.value(),
      "startDate" -> deployment.getStartDate,
      "endDate" -> deployment.getEndDate,
      "duration" -> deployment.getDuration,
      "releaseId" -> shortenId(deployment.getReleaseId),
      "releaseTitle" -> deployment.getReleaseTitle.truncate(COLUMN_LENGTH_TITLE),
      "taskId" -> getFolderlessId(deployment.getTaskId),
      "taskTitle" -> deployment.getTaskTitle.truncate(COLUMN_LENGTH_TITLE),
      "taskType" -> deployment.getTaskType,
      "sourceId" -> Option(deployment.getSourceId).map(getName).orNull,
      "taskOwner" -> deployment.getTaskOwner.truncate(COLUMN_LENGTH_TITLE),
      "taskTeam" -> deployment.getTaskTeam.truncate(COLUMN_LENGTH_TITLE),
      "releaseOwner" -> deployment.getReleaseOwner.truncate(COLUMN_LENGTH_TITLE),
      "isAutomated" -> (if (deployment.isAutomated) 1 else 0),
      "failuresCount" -> deployment.getFailuresCount
    ), ps => Try(ps.execute()))
  }

  private val STMT_DELETE_DEPLOYMENT_BY_ID =
    s"""|DELETE FROM ${DEPLOYMENTS.TABLE}
        | WHERE ${DEPLOYMENTS.DEPLOYMENT_ID} = :deploymentId""".stripMargin

  def delete(deploymentId: CiId): Unit = sqlExec(STMT_DELETE_DEPLOYMENT_BY_ID,
    params("deploymentId" -> getName(deploymentId.normalized)), ps => Try(ps.execute()))

  private val STMT_DELETE_AUTO_GENERATED_DEPLOYMENTS =
    s"""|DELETE FROM ${DEPLOYMENTS.TABLE}
        | WHERE ${DEPLOYMENTS.RELEASE_ID} = :releaseId
        | AND ${DEPLOYMENTS.TASK_ID} = :taskId
        | AND ${DEPLOYMENTS.SOURCE_ID} IS NULL""".stripMargin

  def deleteAllAutoGenerated(taskId: String): Unit = {
    sqlExec(STMT_DELETE_AUTO_GENERATED_DEPLOYMENTS,
      params(
        "releaseId" -> shortenId(releaseIdFrom(taskId)),
        "taskId" -> getFolderlessId(taskId)
      ), ps => Try(ps.execute()))
  }

  private val STMT_EXISTS_DEPLOYMENT_BY_ID: String = s"SELECT COUNT(*) FROM ${DEPLOYMENTS.TABLE} WHERE ${DEPLOYMENTS.DEPLOYMENT_ID} = :deploymentId"

  def exists(deploymentId: CiId): Boolean = sqlQuery(STMT_EXISTS_DEPLOYMENT_BY_ID,
    params("deploymentId" -> getName(deploymentId.normalized)), _.getInt(1) > 0).head

  private val STMT_FIND_DASHBOARD_BY_ID =
    s"""|SELECT depl.*
        | FROM ${DEPLOYMENTS.TABLE} depl
        | WHERE depl.${DEPLOYMENTS.DEPLOYMENT_ID} = ?""".stripMargin

  def findById(deploymentId: CiId): Option[Deployment] = {
    findOptional(_.queryForObject(STMT_FIND_DASHBOARD_BY_ID, deploymentMapper, getName(deploymentId.normalized)))
  }

  def findByQuery(sqlWithParameters: SqlWithParameters): Seq[Deployment] = {
    val (sql, params) = sqlWithParameters
    jdbcTemplate.query[Deployment](sql, params.toArray, deploymentMapper).asScala
  }

  private val deploymentMapper: RowMapper[Deployment] = (rs: ResultSet, _: Int) => {
    val deployment = new Deployment
    Try(rs.getString(DEPLOYMENTS.DEPLOYMENT_ID)).fold(_ => null, value => deployment.setDeploymentId(value))
    Try(rs.getString(DEPLOYMENTS.APPLICATION_ID)).fold(_ => null, value => deployment.setApplicationId(value))
    Try(rs.getString(DEPLOYMENTS.ENVIRONMENT_ID)).fold(_ => null, value => deployment.setEnvironmentId(value))
    Try(rs.getString(DEPLOYMENTS.APPLICATION_NAME)).fold(_ => null, value => deployment.setApplicationName(value))
    Try(rs.getString(DEPLOYMENTS.ENVIRONMENT_NAME)).fold(_ => null, value => deployment.setEnvironmentName(value))
    Try(rs.getString(DEPLOYMENTS.VERSION)).fold(_ => null, value => deployment.setVersion(value))
    Try(rs.getString(DEPLOYMENTS.STATUS)).fold(_ => null, value => deployment.setStatus(DeploymentStatus.find(value)))
    Try(rs.getTimestamp(DEPLOYMENTS.START_DATE)).fold(_ => null, value => deployment.setStartDate(Option(value).map(ts => new Date(ts.getTime)).orNull))
    Try(rs.getTimestamp(DEPLOYMENTS.END_DATE)).fold(_ => null, value => deployment.setEndDate(Option(value).map(ts => new Date(ts.getTime)).orNull))
    Try(rs.getInt(DEPLOYMENTS.DURATION)).fold(_ => null, value => deployment.setDuration(value))
    Try(rs.getString(DEPLOYMENTS.RELEASE_ID)).fold(_ => null, value => deployment.setReleaseId(value))
    Try(rs.getString(DEPLOYMENTS.RELEASE_TITLE)).fold(_ => null, value => deployment.setReleaseTitle(value))
    Try(rs.getString(DEPLOYMENTS.TASK_ID)).fold(_ => null, value => deployment.setTaskId(value))
    Try(rs.getString(DEPLOYMENTS.TASK_TITLE)).fold(_ => null, value => deployment.setTaskTitle(value))
    Try(rs.getString(DEPLOYMENTS.TASK_TYPE)).fold(_ => null, value => deployment.setTaskType(value))
    Try(rs.getString(DEPLOYMENTS.SOURCE_ID)).fold(_ => null, value => deployment.setSourceId(value))
    Try(rs.getString(DEPLOYMENTS.TASK_OWNER)).fold(_ => null, value => deployment.setTaskOwner(value))
    Try(rs.getString(DEPLOYMENTS.TASK_TEAM)).fold(_ => null, value => deployment.setTaskTeam(value))
    Try(rs.getString(DEPLOYMENTS.RELEASE_OWNER)).fold(_ => null, value => deployment.setReleaseOwner(value))
    Try(rs.getInt(DEPLOYMENTS.FAILURES_COUNT)).fold(_ => 0, value => deployment.setFailuresCount(value))
    Try(rs.getInt(DEPLOYMENTS.IS_AUTOMATED)).fold(_ => false, value => deployment.setAutomated(value == 1))
    deployment
  }

}

package com.xebialabs.xlrelease.udm.reporting.repository.sql.queries

import java.util.{Map => JMap}

import com.xebialabs.xlrelease.db.sql.SqlBuilder
import com.xebialabs.xlrelease.db.sql.SqlBuilder.Dialect
import com.xebialabs.xlrelease.environments.repository.sql.persistence.EnvironmentPersistence
import com.xebialabs.xlrelease.environments.repository.sql.persistence.schema.EnvironmentLabelSchema.ENV_LABELS
import com.xebialabs.xlrelease.environments.repository.sql.persistence.schema.EnvironmentSchema.{ENVIRONMENTS, ENV_TO_LABEL}
import com.xebialabs.xlrelease.environments.repository.sql.persistence.schema.EnvironmentStageSchema.ENV_STAGES
import com.xebialabs.xlrelease.plugins.dashboard.domain.Tile
import com.xebialabs.xlrelease.reports.filters.{CompositeFilter, ReportFilter}
import com.xebialabs.xlrelease.repository.Ids.getName
import com.xebialabs.xlrelease.udm.reporting.filters.{EnvironmentLabelFilter, EnvironmentStageFilter}
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.annotation.Isolation.READ_COMMITTED
import org.springframework.transaction.annotation.Propagation.REQUIRED

import scala.collection.JavaConverters._

@Transactional(value="reportingTransactionManager", propagation = REQUIRED, isolation = READ_COMMITTED, readOnly = true, rollbackFor = Array(classOf[Throwable]))
trait DeploymentQuery {

  def execute(tile: Tile): AnyRef = execute(tile, Map.empty[String, Any].asJava)

  def execute(tile: Tile, additionalParameters: JMap[String, Any]): AnyRef

  val environmentPersistence: EnvironmentPersistence
  implicit val dialect: Dialect

  protected def getEnvironmentIds(filters: Seq[ReportFilter]): Option[Seq[String]] = {

    def gatherIds(filters: Seq[ReportFilter], stageIds: List[String], labelIds: List[String]): (List[String], List[String]) = {
      filters.foldLeft(stageIds, labelIds) {
        case ((acc1, acc2), p) => p match {
          case stageFilter: EnvironmentStageFilter => (getName(stageFilter.getEnvironmentStageId) :: acc1, acc2)
          case labelFilter: EnvironmentLabelFilter => (acc1, getName(labelFilter.getEnvironmentLabelId) :: acc2)
          case compositeFilter: CompositeFilter => gatherIds(compositeFilter.getFilters.asScala, acc1, acc2)
          case _ => (acc1, acc2)
        }
      }
    }

    val (stageIds, labelIds) = gatherIds(filters, List.empty, List.empty)

    val envSql = new EnvironmentIdSqlBuilder()
      .select()
      .withStageIds(stageIds)
      .withLabelIds(labelIds)
      .build()

    if (stageIds.nonEmpty || labelIds.nonEmpty) {
      val environmentIds = environmentPersistence.findIdsByQuery(envSql)
      if (environmentIds.isEmpty) None else Some(environmentIds)
    } else {
      Some(Seq.empty)
    }
  }

  class EnvironmentIdSqlBuilder(implicit dialect: Dialect) extends SqlBuilder[EnvironmentIdSqlBuilder] {
    private val envAlias = "env"
    private val envToLabelAlias = "envToLabel"
    private val envLabelAlias = "envLabel"
    private val envStageAlias = "envStage"

    def select(): EnvironmentIdSqlBuilder = {
      select(
        s"""SELECT DISTINCT $envAlias.${ENVIRONMENTS.ID}
           | FROM ${ENVIRONMENTS.TABLE} $envAlias
           | LEFT OUTER JOIN ${ENV_TO_LABEL.TABLE} $envToLabelAlias on $envToLabelAlias.${ENV_TO_LABEL.ENVIRONMENT_UID} = $envAlias.${ENVIRONMENTS.CI_UID}
           | LEFT OUTER JOIN ${ENV_LABELS.TABLE} $envLabelAlias on $envLabelAlias.${ENV_LABELS.CI_UID} = $envToLabelAlias.${ENV_TO_LABEL.LABEL_UID}
           | LEFT OUTER JOIN ${ENV_STAGES.TABLE} $envStageAlias ON $envStageAlias.${ENV_STAGES.CI_UID} = $envAlias.${ENVIRONMENTS.ENV_STAGE_UID}
     """.stripMargin)
      this
    }

    def withStageIds(stageIds: Seq[String]): EnvironmentIdSqlBuilder = {
      if (stageIds.nonEmpty) {
        conditions ++= whereInCondition(s"$envStageAlias.${ENV_STAGES.ID}", stageIds).toList
      }
      this
    }

    def withLabelIds(labelIds: Seq[String]): EnvironmentIdSqlBuilder = {
      if (labelIds.nonEmpty) {
        conditions ++= whereInCondition(s"$envLabelAlias.${ENV_LABELS.ID}", labelIds).toList
      }
      this
    }
  }

}

import { format } from 'date-fns'
import { ContestLog, Ranking, RankingRegistrationOverview } from '../interfaces'
import { Contest } from '../../contest/interfaces'
import { formatLanguageName, formatMediaDescription } from '../transform/format'
import { graphColor } from '../../ui/components/Graphs'
import { getLanguageCodesFrom } from '../domain'

// Utils
const getDates = (startDate: Date, endDate: Date) => {
  const dates = []

  let currentDate = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
    ),
  )

  while (currentDate < endDate) {
    dates.push(currentDate)

    currentDate = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate() + 1,
      ),
    )
  }

  return dates
}

// Graph aggregators

interface AggregatedReadingActivity {
  aggregated: {
    [languageCode: string]: AggregatedReadingActivityEntry[]
  }
  legend: {
    title: string
    strokeWidth: number
  }[]
}

interface InitializedAggregatedReadingActivity {
  aggregated: {
    [languageCode: string]: { [date: string]: AggregatedReadingActivityEntry }
  }
  legend: {
    title: string
    strokeWidth: number
  }[]
}

export interface AggregatedReadingActivityEntry {
  x: string // date in iso string for x axis
  y: number // page count for y axis
  language: string
}

interface AggregatedReadingActivitySeries {
  [date: string]: AggregatedReadingActivityEntry
}

const initializeAggregatedReadingAcitvity = (
  logs: ContestLog[],
  contest: Contest,
): InitializedAggregatedReadingActivity => {
  const languages = getLanguageCodesFrom(logs)

  const initializedSeries: AggregatedReadingActivitySeries = getDates(
    contest.start,
    contest.end,
  )
    .map(date => date.toISOString())
    .reduce(
      (accumulator, date) => ({
        ...accumulator,
        [date]: {
          x: date,
          y: 0,
          language: '',
        },
      }),
      {},
    )

  let aggregated: InitializedAggregatedReadingActivity['aggregated'] = languages.reduce(
    (accumulator, language) => ({
      ...accumulator,
      [language]: seriesWithLanguage(initializedSeries, language),
    }),
    {},
  )

  let legend: InitializedAggregatedReadingActivity['legend'] = languages.map(
    languageCode => ({
      title: formatLanguageName(languageCode),
      strokeWidth: 10,
    }),
  )

  languages.forEach(language => {
    const series: typeof initializedSeries = {}

    Object.keys(initializedSeries).forEach(date => {
      series[date] = {
        ...initializedSeries[date],
        language: formatLanguageName(language),
      }
    })

    aggregated[language] = series
  })

  return {
    aggregated,
    legend,
  }
}

const seriesWithLanguage = (
  series: AggregatedReadingActivitySeries,
  language: string,
): AggregatedReadingActivitySeries => {
  return series
}

export const aggregateReadingActivity = (
  logs: ContestLog[],
  contest: Contest,
): AggregatedReadingActivity => {
  const { aggregated, legend } = initializeAggregatedReadingAcitvity(
    logs,
    contest,
  )

  logs.forEach(log => {
    const date = format(log.date, 'yyMMdd')

    if (aggregated[log.languageCode][date]) {
      aggregated[log.languageCode][date].y +=
        Math.round(log.adjustedAmount * 10) / 10
    }
  })

  const result: AggregatedReadingActivity = { aggregated: {}, legend }

  Object.keys(aggregated).forEach(languageCode => {
    result.aggregated[languageCode] = Object.values(aggregated[languageCode])
  })

  return result
}

interface AggregatedMediaDistribution {
  aggregated: {
    amount: number
    medium: string
    color: string
  }[]
  totalAmount: number
  legend: {
    title: string
    strokeWidth: number
    color: string
    amount: number
  }[]
}

export const aggregateMediaDistribution = (
  logs: ContestLog[],
): AggregatedMediaDistribution => {
  const aggregated: {
    [mediumId: number]: number
  } = {}

  let total = 0
  logs.forEach(log => {
    if (!Object.keys(aggregated).includes(log.mediumId.toString())) {
      aggregated[log.mediumId] = 0
    }

    aggregated[log.mediumId] += log.adjustedAmount
    total += log.adjustedAmount
  })

  let forChart = Object.keys(aggregated)
    .map(k => Number(k))
    .map((k, i) => ({
      amount: aggregated[k],
      medium: formatMediaDescription(k),
      color: graphColor(i),
    }))

  forChart.sort((a, b) => b.amount - a.amount)

  let legend = Object.values(forChart).map(mediumStats => ({
    title: mediumStats.medium,
    color: mediumStats.color,
    strokeWidth: 10,
    amount: mediumStats.amount,
  }))

  return { aggregated: forChart, legend, totalAmount: total }
}

export const rankingsToRegistrationOverview = (
  rankings: Ranking[],
): RankingRegistrationOverview | undefined => {
  if (rankings.length === 0) {
    return undefined
  }

  const registrations = rankings
    .map(r => ({
      languageCode: r.languageCode,
      amount: r.amount,
    }))
    .reduce((acc, element) => {
      if (element.languageCode === 'GLO') {
        return [element, ...acc]
      }
      return [...acc, element]
    }, [] as { languageCode: string; amount: number }[])

  return {
    contestId: rankings[0].contestId,
    userId: rankings[0].userId,
    userDisplayName: rankings[0].userDisplayName,
    registrations,
  }
}

import { useQuery } from 'react-query'

import { useIsUserUnderageBeneficiary } from 'features/profile/utils'
import {
  fetchAlgoliaHits,
  filterAlgoliaHit,
  useTransformAlgoliaHits,
} from 'libs/algolia/fetchAlgolia'
import { env } from 'libs/environment'
import { GeoCoordinates, useGeolocation } from 'libs/geolocation'
import { eventMonitoring } from 'libs/monitoring'
import { QueryKeys } from 'libs/queryKeys'
import { IncompleteSearchHit, SearchHit } from 'libs/search'
import { fetchObjects, filterSearchHits } from 'libs/search/fetch/search'
import { useAppSearchBackend } from 'libs/search/fetch/useAppSearchBackend'

import { useUserProfileInfo } from '../api'
import { RecommendationPane } from '../contentful/moduleTypes'

export const useHomeRecommendedHits = (
  recommendationModule: RecommendationPane | undefined
): SearchHit[] => {
  const { data: recommendedIds } = useRecommendedOfferIds(recommendationModule)
  return useRecommendedHits(recommendedIds?.recommended_offers || [])
}

export const getRecommendationEndpoint = (
  userId: number | undefined,
  position: GeoCoordinates | null
): string | undefined => {
  if (!userId) return undefined
  const endpoint = `${env.RECOMMENDATION_ENDPOINT}/recommendation/${userId}?token=${env.RECOMMENDATION_TOKEN}`

  if (position) return `${endpoint}&longitude=${position.longitude}&latitude=${position.latitude}`
  return endpoint
}

const useRecommendationEndpoint = (userId: number | undefined) => {
  const { position } = useGeolocation()
  return getRecommendationEndpoint(userId, position) as string
}

const useRecommendedOfferIds = (recommendationModule: RecommendationPane | undefined) => {
  const { data: profile } = useUserProfileInfo()
  const userId = profile?.id
  const recommendationEndpoint = useRecommendationEndpoint(userId)

  return useQuery(
    QueryKeys.RECOMMENDATION_OFFER_IDS,
    async () => {
      const response = await fetch(recommendationEndpoint)
      if (response.ok) {
        return response.json() as Promise<{ recommended_offers: string[] }>
      } else {
        eventMonitoring.captureException(
          new Error(
            `Error with recommendation endpoint: ${recommendationEndpoint}. status code ${response.status}`
          )
        )
        return { recommended_offers: [] }
      }
    },
    { enabled: !!recommendationModule && typeof userId === 'number' && !!recommendationEndpoint }
  )
}

const useRecommendedHits = (ids: string[]): SearchHit[] => {
  const { enabled, isAppSearchBackend } = useAppSearchBackend()
  const isUserUnderage = useIsUserUnderageBeneficiary()
  const transformHits = useTransformAlgoliaHits()

  const fetchHits = isAppSearchBackend ? fetchObjects : fetchAlgoliaHits
  const filterHits = isAppSearchBackend ? filterSearchHits : filterAlgoliaHit

  const { data: hits = [] } = useQuery(
    QueryKeys.RECOMMENDATION_HITS,
    async () => await fetchHits(ids, isUserUnderage),
    { enabled: ids.length > 0 && enabled }
  )

  return (hits as IncompleteSearchHit[]).filter(filterHits).map(transformHits) as SearchHit[]
}

import { useQuery } from 'react-query'

import { QueryKeys } from 'libs/queryKeys'
import { fetchVenues } from 'libs/search/fetch/search'
import { useAppSearchBackend } from 'libs/search/fetch/useAppSearchBackend'
import { SuggestedVenue } from 'libs/venue'

const STALE_TIME_VENUES = 5 * 60 * 1000

export const useVenues = (query: string) => {
  const { enabled, isAppSearchBackend } = useAppSearchBackend()

  // TODO(antoinewg, #PC-11353): make fetchVenues depend on search backend
  return useQuery<SuggestedVenue[]>([QueryKeys.VENUES, query], () => fetchVenues(query), {
    staleTime: STALE_TIME_VENUES,
    // TODO(antoinewg) remove condition once migration to AppSearch is complete
    // TODO(antoinewg, #PC-11353): remove isAppSearchBackend
    enabled: query.length > 0 && enabled && isAppSearchBackend,
  })
}

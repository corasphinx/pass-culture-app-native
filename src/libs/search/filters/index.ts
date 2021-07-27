import { SearchOptions } from '@elastic/app-search-javascript'

import { SearchParameters } from 'features/search/types'
import { buildBoosts } from 'libs/search/filters/buildBoosts'

import { buildFacetFilters } from './buildFacetFilters'
import { buildGeolocationFilter } from './buildGeolocationFilter'
import { buildNumericFilters } from './buildNumericFilters'
import { AppSearchFields, RESULT_FIELDS, SORT_OPTIONS } from './constants'

export const buildQueryOptions = (
  params: SearchParameters,
  page?: number
): SearchOptions<AppSearchFields> => {
  const queryOptions: SearchOptions<AppSearchFields> = {
    result_fields: RESULT_FIELDS,
    filters: {
      all: [
        ...buildFacetFilters(params),
        ...buildNumericFilters(params),
        ...buildGeolocationFilter(params),
      ],
    },
    page: {
      current: page || 1,
      size: params.hitsPerPage || 20,
    },
    group: {
      // This ensures that only one offer of each group is retrieved.
      // Ex: when we look for a book, we only show one per isbn (one per visa for the movies).
      // See https://www.elastic.co/fr/blog/advanced-search-queries-in-elastic-app-search
      field: AppSearchFields.group,
    },
    sort: SORT_OPTIONS,
  }

  const boosts = buildBoosts(params.geolocation)
  if (boosts) {
    queryOptions['boosts'] = boosts
  }

  return queryOptions
}

export { AppSearchFields, RESULT_FIELDS }

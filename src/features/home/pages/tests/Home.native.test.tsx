import { rest } from 'msw'
import React from 'react'
import waitForExpect from 'wait-for-expect'

import { useRoute } from '__mocks__/@react-navigation/native'
import { UserProfileResponse } from 'api/gen'
import { AuthContext } from 'features/auth/AuthContext'
import { ProcessedModule } from 'features/home/contentful'
import { RecommendationPane } from 'features/home/contentful/moduleTypes'
import { analytics } from 'libs/analytics'
import { env } from 'libs/environment'
import { mockedAlgoliaResponse } from 'libs/search/fixtures'
import { reactQueryProviderHOC } from 'tests/reactQueryProviderHOC'
import { server } from 'tests/server'
import { flushAllPromises, superFlushWithAct, render, act } from 'tests/utils'

import { Home } from '../Home'

jest.mock('features/home/pages/useShowSkeleton', () => ({
  useShowSkeleton: jest.fn(() => false),
}))

useRoute.mockImplementation(() => ({ params: { entryId: 'specific_entry_id' } }))

let mockDisplayedModules: ProcessedModule[] = []
jest.mock('features/home/pages/useDisplayedHomeModules', () => ({
  useDisplayedHomeModules: jest.fn(() => ({
    displayedModules: mockDisplayedModules,
    homeModules: {},
    recommendedHits: mockedAlgoliaResponse.hits.slice(0, 4),
  })),
}))

function simulateAuthenticatedUser(partialUser?: Partial<UserProfileResponse>) {
  const user = {
    email: 'email@domain.ext',
    firstName: 'Jean',
    isBeneficiary: true,
    depositExpirationDate: '2023-02-16T17:16:04.735235',
    domainsCredit: {
      all: { initial: 50000, remaining: 49600 },
      physical: { initial: 20000, remaining: 0 },
      digital: { initial: 20000, remaining: 19600 },
    },
    ...(partialUser || {}),
  }
  server.use(
    rest.get<UserProfileResponse>(env.API_BASE_URL + '/native/v1/me', (req, res, ctx) =>
      res(ctx.status(200), ctx.json(user))
    )
  )
}

describe('Home component', () => {
  it('should render correctly without login modal', async () => {
    env.FEATURE_FLIPPING_ONLY_VISIBLE_ON_TESTING = false
    const home = await homeRenderer({ isLoggedIn: false })
    expect(home).toMatchSnapshot()
  })

  it('should have a welcome message', async () => {
    const { getByText } = await homeRenderer({ isLoggedIn: false })
    const welcomeText = getByText('Bienvenue !')
    expect(welcomeText.props.children).toBe('Bienvenue !')
  })

  it('should have a personalized welcome message when user is logged in', async () => {
    const { getByText } = await homeRenderer({ isLoggedIn: true })
    await waitForExpect(() => {
      expect(getByText('Bonjour Jean')).toBeTruthy()
    })
  })

  it('should show the available credit to the user - remaining', async () => {
    const { getByText } = await homeRenderer({ isLoggedIn: true })
    await waitForExpect(() => {
      expect(getByText('Tu as 496 € sur ton pass')).toBeTruthy()
    })
  })

  it('should show the available credit to the user - expired', async () => {
    const { queryByText, getByText } = await homeRenderer({
      isLoggedIn: true,
      partialUser: { depositExpirationDate: new Date('2020-02-16T17:16:04.735235') },
    })
    await waitForExpect(() => {
      expect(getByText('Ton crédit est expiré')).toBeTruthy()
      expect(queryByText('Tu as 496 € sur ton pass')).toBeFalsy()
    })
  })

  it('should show the available credit to the user - not logged in', async () => {
    const { queryByText } = await homeRenderer({ isLoggedIn: false })
    expect(queryByText('Toute la culture à portée de main')).toBeTruthy()
  })

  it('should show the available credit to the user - not beneficiary', async () => {
    const { queryByText } = await homeRenderer({
      isLoggedIn: true,
      partialUser: { isBeneficiary: false },
    })
    expect(queryByText('Toute la culture à portée de main')).toBeTruthy()
  })

  it('should not have code push button', async () => {
    const home = await homeRenderer({})
    expect(home.queryByText('Check update')).toBeFalsy()
  })

  it('should have CheatMenu button when FEATURE_FLIPPING_ONLY_VISIBLE_ON_TESTING=true', async () => {
    env.FEATURE_FLIPPING_ONLY_VISIBLE_ON_TESTING = true
    const home = await homeRenderer({ isLoggedIn: false })
    expect(home.queryByText('CheatMenu')).toBeTruthy()
  })

  it('should NOT have CheatMenu button when NOT FEATURE_FLIPPING_ONLY_VISIBLE_ON_TESTING=false', async () => {
    env.FEATURE_FLIPPING_ONLY_VISIBLE_ON_TESTING = false
    const home = await homeRenderer({ isLoggedIn: false })
    expect(home.queryByText('CheatMenu')).toBeFalsy()
  })
})

describe('Home component - Analytics', () => {
  const nativeEventMiddle = {
    layoutMeasurement: { height: 1000 },
    contentOffset: { y: 400 }, // how far did we scroll
    contentSize: { height: 1600 },
  }
  const nativeEventBottom = {
    layoutMeasurement: { height: 1000 },
    contentOffset: { y: 900 },
    contentSize: { height: 1600 },
  }

  it('should trigger logEvent "AllModulesSeen" when reaching the end', async () => {
    const home = await homeRenderer({ isLoggedIn: false })
    const scrollView = home.getByTestId('homeBodyScrollView')
    await act(async () => {
      await flushAllPromises()
    })

    await act(async () => {
      await scrollView.props.onScroll({ nativeEvent: nativeEventMiddle })
    })
    expect(analytics.logAllModulesSeen).not.toHaveBeenCalled()

    await act(async () => {
      await scrollView.props.onScroll({ nativeEvent: nativeEventBottom })
    })

    expect(analytics.logAllModulesSeen).toHaveBeenCalledWith(0)
  })

  it('should trigger logEvent "AllModulesSeen" only once', async () => {
    const home = await homeRenderer({ isLoggedIn: false })
    const scrollView = home.getByTestId('homeBodyScrollView')

    await act(async () => {
      await flushAllPromises()
    })

    await act(async () => {
      // 1st scroll to bottom => trigger
      await scrollView.props.onScroll({ nativeEvent: nativeEventBottom })
      await flushAllPromises()
    })
    expect(analytics.logAllModulesSeen).toHaveBeenCalledWith(0)

    // @ts-expect-error: logAllModulesSeen is the mock function but is seen as the real function
    analytics.logAllModulesSeen.mockClear()

    await act(async () => {
      // 2nd scroll to bottom => NOT trigger
      await scrollView.props.onScroll({ nativeEvent: nativeEventMiddle })
      await scrollView.props.onScroll({ nativeEvent: nativeEventBottom })
      await flushAllPromises()
    })

    expect(analytics.logAllModulesSeen).not.toHaveBeenCalled()
  })

  it('should trigger logEvent "RecommendationModuleSeen" when reaching the recommendation module', async () => {
    mockDisplayedModules = [
      new RecommendationPane({
        display: { title: 'Tes offres recommandées', minOffers: 2, layout: 'one-item-medium' },
      }),
    ]
    const home = await homeRenderer({ isLoggedIn: false })
    const scrollView = home.getByTestId('homeBodyScrollView')

    await act(async () =>
      home
        .getByTestId('recommendationModuleTracker')
        .props.onLayout({ nativeEvent: { layout: { y: 1500 } } })
    )
    expect(home.getByTestId('recommendationModuleTracker')).toBeTruthy()

    await act(async () => {
      await scrollView.props.onScroll({ nativeEvent: nativeEventMiddle })
    })
    expect(analytics.logRecommendationModuleSeen).not.toHaveBeenCalled()

    await act(async () => {
      await scrollView.props.onScroll({ nativeEvent: nativeEventBottom })
    })
    expect(analytics.logRecommendationModuleSeen).toHaveBeenCalledWith('Tes offres recommandées', 4)
  })
})

interface Params {
  isLoggedIn?: boolean | undefined
  partialUser?: Partial<UserProfileResponse>
}

const defaultParams: Params = {
  isLoggedIn: false,
  partialUser: {},
}

async function homeRenderer({ isLoggedIn, partialUser }: Params = defaultParams) {
  if (isLoggedIn) simulateAuthenticatedUser(partialUser)
  const renderAPI = render(<Home />, {
    wrapper: ({ children }) =>
      // eslint-disable-next-line local-rules/no-react-query-provider-hoc
      reactQueryProviderHOC(
        <AuthContext.Provider value={{ isLoggedIn: !!isLoggedIn, setIsLoggedIn: jest.fn() }}>
          {children}
        </AuthContext.Provider>
      ),
  })
  await superFlushWithAct(50)
  return renderAPI
}

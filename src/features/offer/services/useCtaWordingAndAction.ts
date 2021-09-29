import { t } from '@lingui/macro'

import {
  OfferResponse,
  FavoriteOfferResponse,
  SearchGroupNameEnum,
  UserProfileResponse,
} from 'api/gen'
import { useAuthContext } from 'features/auth/AuthContext'
import { useUserProfileInfo } from 'features/home/api'
import { openExternalUrl, navigateToBooking } from 'features/navigation/helpers'
import { getOfferPrice } from 'features/offer/services/getOfferPrice'
import { isUserUnderageBeneficiary } from 'features/profile/utils'
import { CategoryCriteria } from 'features/search/enums'
import { useAvailableCategories } from 'features/search/utils/useAvailableCategories'
import { analytics } from 'libs/analytics'
import { useSubcategoriesMapping } from 'libs/subcategories'
import { Subcategory } from 'libs/subcategories/types'

import { useOffer } from '../api/useOffer'

import { useHasEnoughCredit } from './useHasEnoughCredit'

const getIsBookedOffer = (
  offerId: FavoriteOfferResponse['id'],
  bookedOffersIds: UserProfileResponse['bookedOffers'] = {}
): boolean => bookedOffersIds[offerId] !== undefined

interface Props {
  isLoggedIn: boolean
  isBeneficiary: boolean
  offer: OfferResponse
  subcategory: Subcategory
  hasEnoughCredit: boolean
  bookedOffers: UserProfileResponse['bookedOffers']
  availableCategories: Partial<CategoryCriteria>
  isUnderageBeneficiary: boolean
}
interface ICTAWordingAndAction {
  isExternal?: boolean
  wording?: string
  onPress?: () => void
}

// Follow logic of https://www.notion.so/Modalit-s-d-affichage-du-CTA-de-r-servation-dbd30de46c674f3f9ca9f37ce8333241
export const getCtaWordingAndAction = ({
  isLoggedIn,
  isBeneficiary,
  offer,
  subcategory,
  hasEnoughCredit,
  bookedOffers,
  availableCategories,
  isUnderageBeneficiary,
}: Props): ICTAWordingAndAction | undefined => {
  const { externalTicketOfficeUrl } = offer
  const isAlreadyBookedOffer = getIsBookedOffer(offer.id, bookedOffers)
  const isOfferCategoryNotAvailable = !!(
    subcategory.searchGroupName &&
    !Object.keys(availableCategories).includes(subcategory.searchGroupName)
  )

  if (isAlreadyBookedOffer) {
    return {
      isExternal: true,
      wording: t`Voir ma réservation`,
      onPress: () => navigateToBooking(bookedOffers[offer.id]),
    }
  }

  // underage beneficiary cannot book non free digital offers except press category
  const isOfferCategoryNotBookableByUser =
    isUnderageBeneficiary &&
    offer.isDigital &&
    getOfferPrice(offer.stocks) !== 0 &&
    subcategory.searchGroupName !== SearchGroupNameEnum.PRESSE

  // Non beneficiary or educational offer or unavailable offer for user
  if (
    !isLoggedIn ||
    !isBeneficiary ||
    offer.isEducational ||
    isOfferCategoryNotAvailable ||
    isOfferCategoryNotBookableByUser
  ) {
    if (!externalTicketOfficeUrl) return { wording: undefined }

    return {
      isExternal: true,
      wording: subcategory.isEvent ? t`Accéder à la billetterie` : t`Accéder à l'offre`,
      onPress: () => openExternalUrl(externalTicketOfficeUrl),
    }
  }

  // Beneficiary
  if (!offer.isReleased) return { wording: t`Offre expirée` }
  if (offer.isExpired) return { wording: t`Offre expirée` }
  if (offer.isSoldOut) return { wording: t`Offre épuisée` }

  if (!subcategory.isEvent) {
    if (!hasEnoughCredit) {
      if (offer.isDigital) return { wording: t`Crédit numérique insuffisant` }
      return { wording: t`Crédit insuffisant` }
    }

    return {
      wording: t`Réserver`,
      onPress: () => {
        analytics.logClickBookOffer(offer.id)
      },
    }
  }

  if (subcategory.isEvent) {
    if (!hasEnoughCredit) return { wording: t`Crédit insuffisant` }

    return {
      wording: t`Voir les disponibilités`,
      onPress: () => {
        analytics.logConsultAvailableDates(offer.id)
      },
    }
  }
  return
}

export const useCtaWordingAndAction = (props: {
  offerId: number
}): ICTAWordingAndAction | undefined => {
  const { offerId } = props
  const { isLoggedIn } = useAuthContext()
  const { data: user } = useUserProfileInfo()
  const { data: offer } = useOffer({ offerId })
  const hasEnoughCredit = useHasEnoughCredit(offerId)
  const availableCategories = useAvailableCategories()
  const isUnderageBeneficiary = isUserUnderageBeneficiary(user)
  const mapping = useSubcategoriesMapping()

  if (!offer) return

  /* check I have all information to calculate wording
   * why: avoid flash on CTA wording
   */
  if (isLoggedIn === null || user === null) return

  const { isBeneficiary = false, bookedOffers = {} } = user || {}
  return getCtaWordingAndAction({
    isLoggedIn,
    isBeneficiary,
    offer,
    subcategory: mapping[offer.subcategoryId],
    hasEnoughCredit,
    bookedOffers,
    availableCategories,
    isUnderageBeneficiary,
  })
}

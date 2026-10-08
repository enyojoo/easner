/** Personal Banking page screens (design system: AppHome, AppSend, AppSendReview, AppMore). */
import {
  AppHomeScreen,
  AppReceiveScreen,
  AppSecurityScreen,
  AppSendAmountScreen,
  AppSendRecipientsScreen,
  AppSendReviewScreen,
} from "../app-screens"
import { at, phoneCard, type Canvas } from "../canvas"
import { PhoneFrame } from "../frames"

export const PERSONAL_SLOTS: Record<string, Canvas> = {
  "mkt-hero-personal-01": {
    width: 720,
    height: 620,
    render: () => (
      <>
        {at(
          0,
          0,
          <PhoneFrame>
            <AppHomeScreen />
          </PhoneFrame>,
          1,
        )}
        {at(
          320,
          60,
          <PhoneFrame>
            <AppSendReviewScreen />
          </PhoneFrame>,
          2,
        )}
      </>
    ),
    mobile: phoneCard(<AppHomeScreen />),
  },
  "mkt-ui-personal-send": phoneCard(<AppSendAmountScreen />),
  "mkt-ui-personal-receive": phoneCard(<AppReceiveScreen />),
  "mkt-ui-personal-recipients": phoneCard(<AppSendRecipientsScreen />),
  "mkt-ui-personal-security": phoneCard(<AppSecurityScreen />),
}

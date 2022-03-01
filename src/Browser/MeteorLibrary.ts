import mapValues from 'lodash/mapValues'
import omit from 'lodash/omit'
import { JSONUtils } from '@/Utils/JSONUtils'

export const getSubscriptions = () => {
  const payload = mapValues(
    Meteor?.remoteConnection?._subscriptions ?? {},
    (value: any) => omit(value, ['connection']),
  )

  return JSONUtils.stringify(payload)
}

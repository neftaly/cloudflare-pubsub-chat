// Gets a bunch of tokens
// { [clientId]: token, .... }
export const getCredentials = ({
  apiToken,
  accountId,
  namespace,
  broker,
  number = 1,
  type = 'TOKEN',
  topicAcl = '#',
  expiration = 60 * 60 * 24 * 7 // token expiry time in seconds - set to -1 to use broker default expiration
}) =>
  fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pubsub` +
      `/namespaces/${namespace}/brokers/${broker}/credentials?` +
      `number=${number}&type=${type}&topicAcl=${topicAcl}&` +
      `expiration=${expiration}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`
      }
    }
  )
    .then((response) => {
      if (response.status === 200) return response.json()
      const errorMessage = 'Could not connect to pubsub API'
      console.error(errorMessage, response.status)
      return Promise.reject([`${errorMessage}: ${response.status}`])
    })
    .then(({ success, result, errors }) =>
      success ? result : Promise.reject(errors)
    )

// Gets a single token as a string
export const getToken = (props) =>
  getCredentials({ ...props, type: 'TOKEN', number: 1 }).then(
    (result) => Object.values(result)[0]
  )

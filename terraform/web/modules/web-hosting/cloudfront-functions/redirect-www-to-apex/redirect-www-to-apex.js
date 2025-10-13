/**
 * Redirects www.example.com to example.com.
 * This function is for a 'viewer request' event trigger.
 *
 * Inspired by:
 * - https://stackoverflow.com/a/67460691/4034572
 * - https://stackoverflow.com/a/73102646/4034572
 * - https://github.com/aws-samples/amazon-cloudfront-functions/tree/main/redirect-based-on-country
 */
function handler(event) {
  var request = event.request
  if (!request.headers.host) {
    return request
  }
  var host = request.headers.host.value
  if (host.startsWith('www.')) {
    var apexHost = host.slice(4) // 'www.example.com' -> 'example.com'
    var newUrl = `https://${apexHost}${request.uri}`
    var response = {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: newUrl },
      },
    }
    return response
  }
  return request
}

# Redirect www to non-www (apex)

It redirects `www.example.com/*` to `example.com/*`.

Get the ETag: `aws cloudfront describe-function --name redirect-www-to-apex [--stage DEVELOPMENT/LIVE]`

Test the function:

- `aws cloudfront test-function --if-match <ETag> --name redirect-www-to-apex --event-object fileb://aws/cloudfront-functions/redirect-www-to-apex/test-objects/with-www.json` -> The response should have statusCode 301 and the header 'location' with value "https://example.com/about".
- `aws cloudfront test-function --if-match <ETag> --name redirect-www-to-apex --event-object fileb://aws/cloudfront-functions/redirect-www-to-apex/test-objects/no-www.json` -> The response should just be the same request, without changes.

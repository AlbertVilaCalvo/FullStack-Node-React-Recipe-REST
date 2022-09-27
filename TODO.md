# TODO

## Authentication

- [x] Change email
- [x] Change password
- [x] Delete account
- [x] Send welcome email after registering, alert email after login etc
  - https://medium.com/@SigniorGratiano/express-authentication-and-security-dac99e6b33c
  - https://github.com/platzi/curso-nodejs-auth/blob/13-step/nodemailer.js
- [x] Verify email after registering
  - https://www.simplecode.io/blog/create-a-rest-api-part-4-send-emails-with-amazon-ses/
  - https://www.simplecode.io/blog/create-a-rest-api-part-5-verify-users-with-tokens/
- [ ] If email is not verified, restrict what you can do (eg do not allow to publish recipes)
  - Can be easily done with a middleware that runs after AuthMiddleware.requireLoggedUser, checking `email_verified`
  - We have to show a pop-up to the user after registering, see:
  - https://ux.stackexchange.com/questions/109958/best-way-to-handle-new-user-registration-when-email-verification-is-required
  - https://ux.stackexchange.com/questions/29145/limiting-access-before-email-address-is-confirmed
  - https://ux.stackexchange.com/questions/12367/when-to-explain-email-verification-process-to-the-user
- [ ] When the user changes the email, verify it before overriding the old one. We'll need to store the 2 emails (old and new) temporarily
  - Changing an e-mail sends a verification mail to the user's mailbox, and only after verification - the new email overwrites the old one. [source](https://ux.stackexchange.com/questions/12367/when-to-explain-email-verification-process-to-the-user)
  - What is the suggested best practice for changing a user's email address? - https://security.stackexchange.com/questions/234060/what-is-the-suggested-best-practice-for-changing-a-users-email-address
- [ ] After changing the email, send an informative email to the previous account explaining that someone has changed the email
  - https://www.drupal.org/project/drupal/issues/85494 See point 2: "Sends a notification E-mail to the old address"
- [x] Forgot/recover/reset password
  - https://medium.com/@SigniorGratiano/express-authentication-and-security-dac99e6b33c
  - https://github.com/platzi/curso-nodejs-auth/blob/13-step/services/auth.service.js#L37-L54
  - https://www.simplecode.io/blog/create-a-rest-api-part-7-forgot-reset-password-routes/
- [ ] Logout -> expire token at the server. Requires having a token store
- [ ] If the JWT token expires, do a logout on the client
- [ ] Refresh token. We need an axios interceptor to handle 401 and refresh the token
  - https://javascript.plainenglish.io/expressjs-api-with-secure-jwt-access-and-refresh-token-64c5478be2c0
  - https://medium.com/swlh/authentication-using-jwt-and-refresh-token-part-1-aca5522c14c8
- [ ] Changing the password or resetting the password should invalidate all existing tokens of that user? See https://medium.com/@SigniorGratiano/express-authentication-and-security-dac99e6b33c as an example
- [ ] Once we have a token store, at the Settings page, show a list of the active sessions like in https://github.com/settings/security

## Back and front

- [ ] Pictures
  - [ ] Upload recipe pictures
  - [ ] User avatar picture
  - S3
    - https://medium.com/@teogoulois/image-uploader-with-nextjs-typescript-and-aws-s3-211b38a0af10
    - https://create-react-app.dev/docs/deployment#s3-and-cloudfront
    - https://wolovim.medium.com/deploying-create-react-app-to-s3-or-cloudfront-48dae4ce0af
    - https://medium.com/dailyjs/a-guide-to-deploying-your-react-app-with-aws-s3-including-https-a-custom-domain-a-cdn-and-58245251f081
- [ ] User, add fields:
  - [ ] Bio - see https://github.com/AlbertVilaCalvo
  - [ ] Link to Instagram - see https://github.com/AlbertVilaCalvo
- [ ] Recipe, add fields:
  - [ ] Season
  - [ ] Description or steps
  - [ ] Ingredients
- [ ] Like recipes from other users
- [ ] Comment to recipes

## Back

- [x] Data validation (using zod). Possible options:
  - https://github.com/express-validator/express-validator
  - https://github.com/colinhacks/zod
  - https://github.com/hapijs/joi
- [ ] Add created at & updated at Recipe and User table
- [ ] Redis
  - Curso de Node.js: Autenticación, Microservicios y Redis - https://platzi.com/cursos/nodejs-microservicios - https://github.com/CodingCarlos/proyecto-backend-node-platzi
  - https://github.com/guardian/gateway/search?q=redis
- [ ] JWT blacklist: https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/expirejwt.md
- [ ] HelmetJS
  - https://www.freecodecamp.org/learn/information-security/#information-security-with-helmetjs
  - https://nemethgergely.com/blog/nodejs-security-overview#using-the-helmet-module
  - https://blog.risingstack.com/node-js-security-checklist/
- [ ] Paginate GET /recipe
  - https://stackoverflow.com/questions/776448/pagination-in-a-rest-web-application
- [ ] Re-usable data validation middleware, instead of putting repetitive code at each RequestHandler
  - https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/validation.md
  - https://github.com/platzi/curso-nodejs-postgres/blob/main/middlewares/validator.handler.js (uses joi)
- [ ] Swagger:
  - https://github.com/danielkhan/todolist-backend/blob/master/utils/swagger.js
  - https://github.com/hagopj13/node-express-boilerplate/blob/master/src/routes/v1/auth.route.js
  - https://blog.logrocket.com/documenting-your-express-api-with-swagger/
  - https://www.manning.com/books/designing-apis-with-swagger-and-openapi
- [ ] Full text search of recipes
  - Use PostgreSQL's full-text search functionality to perform natural-language searches of your data. https://lets-go-further.alexedwards.net/
- [ ] Rate limit:
  - https://github.com/nfriedly/express-rate-limit
  - https://github.com/tj/node-ratelimiter
  - https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/login-rate-limit.md
  - https://github.com/guardian/gateway/tree/main/src/server/lib/rate-limit

## Front

- [ ] Footer add my name and link to source code
- [ ] Check navigation with keyboard at forms
- [ ] Why did you render: https://github.com/welldone-software/why-did-you-render
  - Setup requires many extra steps for Create React App :/
  - This alternative seems somewhat similar: https://github.com/shuding/tilg

## Deploy AWS

https://stackoverflow.com/questions/41250087/how-to-deploy-a-react-nodejs-express-application-to-aws

Automate react application deployment on aws, mohamed labouardy
https://livevideo.manning.com/module/536_1_1/automate-react-application-deployment-on-aws-mohamed-labouardy/author-talk/automate-react-application-deployment-on-aws?

### Docker

- https://github.com/platzi/curso-nodejs-auth/blob/13-step/docker-compose.yml

## Various

Read PDF 'JWT Handbook' from Auth0

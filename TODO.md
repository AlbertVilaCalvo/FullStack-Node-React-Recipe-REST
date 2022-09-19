# TODO

## Authentication

- Delete account
- Logout -> expire token at the server. Requires having a token store
- Verify email
  - https://www.simplecode.io/blog/create-a-rest-api-part-4-send-emails-with-amazon-ses/
- Send welcome email after registering, alert email after login etc
  - https://medium.com/@SigniorGratiano/express-authentication-and-security-dac99e6b33c
  - https://github.com/platzi/curso-nodejs-auth/blob/13-step/nodemailer.js
- Forgot/recover password
  - https://medium.com/@SigniorGratiano/express-authentication-and-security-dac99e6b33c
  - https://github.com/platzi/curso-nodejs-auth/blob/13-step/services/auth.service.js#L37-L54
- If the JWT token expires, do a logout on the client
- Refresh token. We need an axios interceptor to handle 401 and refresh the token
  - https://javascript.plainenglish.io/expressjs-api-with-secure-jwt-access-and-refresh-token-64c5478be2c0
  - https://medium.com/swlh/authentication-using-jwt-and-refresh-token-part-1-aca5522c14c8

## Back and front

- Pictures
  - Upload recipe pictures
  - User avatar picture
- User, add fields:
  - Bio - see https://github.com/AlbertVilaCalvo
  - Link to Instagram - see https://github.com/AlbertVilaCalvo
- Recipe, add fields:
  - Season
  - Description or steps
  - Ingredients
- Like recipes from other users
- Comment to recipes

## Back

- Add created at & updated at Recipe and User table
- Redis
  - Curso de Node.js: Autenticación, Microservicios y Redis - https://platzi.com/cursos/nodejs-microservicios - https://github.com/CodingCarlos/proyecto-backend-node-platzi
  - https://github.com/guardian/gateway/search?q=redis
- JWT blacklist: https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/expirejwt.md
- HelmetJS
  - https://www.freecodecamp.org/learn/information-security/#information-security-with-helmetjs
  - https://nemethgergely.com/blog/nodejs-security-overview#using-the-helmet-module
  - https://blog.risingstack.com/node-js-security-checklist/
- Paginate GET /recipe
- Validation middleware?
  - https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/validation.md
  - https://github.com/platzi/curso-nodejs-postgres/blob/main/middlewares/validator.handler.js (utilitza joi)
- Swagger:
  - https://github.com/danielkhan/todolist-backend/blob/master/utils/swagger.js
- Full text search of recipes
  - Use PostgreSQL's full-text search functionality to perform natural-language searches of your data. https://lets-go-further.alexedwards.net/
- Rate limit:
  - https://github.com/nfriedly/express-rate-limit
  - https://github.com/tj/node-ratelimiter
  - https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/login-rate-limit.md
  - https://github.com/guardian/gateway/tree/main/src/server/lib/rate-limit

## Front

- Footer add my name and link to source code
- Check navigation with keyboard at forms
- Why did you render: https://github.com/welldone-software/why-did-you-render
  - Setup requires many extra steps for Create React App :/

## Deploy AWS

https://stackoverflow.com/questions/41250087/how-to-deploy-a-react-nodejs-express-application-to-aws

### Docker

- https://github.com/platzi/curso-nodejs-auth/blob/13-step/docker-compose.yml

## Various

Read PDF 'JWT Handbook' from Auth0

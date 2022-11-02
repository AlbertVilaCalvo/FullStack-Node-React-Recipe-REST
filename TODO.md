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
- [x] Forgot/recover/reset password
  - https://medium.com/@SigniorGratiano/express-authentication-and-security-dac99e6b33c
  - https://github.com/platzi/curso-nodejs-auth/blob/13-step/services/auth.service.js#L37-L54
  - https://www.simplecode.io/blog/create-a-rest-api-part-7-forgot-reset-password-routes/
  - Adds CSRF token at the view new-password.ejs https://github.com/PacktPublishing/Node.js-The-Complete-Guide/tree/main/S17 - https://www.packtpub.com/product/node-js-the-complete-guide/9781838826864
  - Reset password token saved to database: https://github.com/PacktPublishing/Node.js-API-Masterclass-with-Express-and-MongoDB/blob/3129725fa9582011f1e9db3b94e1dda2aafa9f0f/models/User.js#L62 - https://www.packtpub.com/product/node-js-api-masterclass-with-express-and-mongodb/9781800569638
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
- [ ] Similarly, after changing the password, also send an alert email?

## Authentication session

- [ ] Replace JWT with opaque token or session id saved in cookie + session store (Redis/Postgres)
  - JWT blacklist: https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/expirejwt.md
  - https://fusionauth.io/learn/expert-advice/authentication/spa/oauth-authorization-code-grant-jwts-refresh-tokens-cookies
  - Compatible Session Stores: https://github.com/expressjs/session#compatible-session-stores
  - JWT vs. Opaque Tokens - https://news.ycombinator.com/item?id=33018135
  - https://github.com/PacktPublishing/Node.js-The-Complete-Guide/tree/main/S14 - https://www.packtpub.com/product/node-js-the-complete-guide/9781838826864
  - JWT saved in cookie
    - https://medium.com/@SigniorGratiano/express-authentication-and-security-dac99e6b33c
    - https://github.com/kriasoft/node-starter-kit/blob/main/auth/session.ts
    - https://github.com/PacktPublishing/Node.js-API-Masterclass-with-Express-and-MongoDB/blob/master/controllers/auth.js - https://www.packtpub.com/product/node-js-api-masterclass-with-express-and-mongodb/9781800569638
    - https://www.pluralsight.com/courses/securing-javascript-rest-api-json-web-tokens
  - Refresh token on cookie
    - https://dev.to/cotter/localstorage-vs-cookies-all-you-need-to-know-about-storing-jwt-tokens-securely-in-the-front-end-15id
    - https://mannharleen.github.io/2020-04-10-handling-jwt-securely-part-2/
    - https://medium.com/@brakdemir/jwt-authentication-with-csrf-prevention-on-node-js-express-b805504c2829 Code: https://github.com/kbrk/express_csrf_jwt_study
- [ ] On logout, expire session at the server. Requires having a session store and adding a new route /logout
- [ ] If the session expires, do a logout on the client?
- [ ] Changing the password or resetting the password should invalidate all existing sessions of that user? See https://medium.com/@SigniorGratiano/express-authentication-and-security-dac99e6b33c as an example
- [ ] Once we have a session store, at the Settings page, show a list of the active sessions like in https://github.com/settings/security

## Back and front

- [ ] Pictures
  - [ ] Upload recipe pictures
  - [ ] User avatar picture
  - https://github.com/PacktPublishing/The-Complete-Node.js-Developer-Course-3rd-Edition-/tree/master/14.%20File%20Uploads%20(Task%20App) - https://www.packtpub.com/product/the-complete-node-js-developer-course/9781789955071
  - https://www.pluralsight.com/courses/uploading-files-javascript-rest-api
  - https://www.pluralsight.com/courses/managing-files-node-js
  - S3
    - https://betterprogramming.pub/how-to-upload-files-to-amazon-s3-from-nextjs-app-b7ef1909976b
    - https://medium.com/@teogoulois/image-uploader-with-nextjs-typescript-and-aws-s3-211b38a0af10
    - https://create-react-app.dev/docs/deployment#s3-and-cloudfront
    - https://wolovim.medium.com/deploying-create-react-app-to-s3-or-cloudfront-48dae4ce0af
    - https://medium.com/dailyjs/a-guide-to-deploying-your-react-app-with-aws-s3-including-https-a-custom-domain-a-cdn-and-58245251f081
    - Chapter 7 - https://www.amazon.com/Hands-Full-Stack-Development-GraphQL-React/dp/1789134528/ - https://www.packtpub.com/product/full-stack-web-development-with-graphql-and-react/9781801077880
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
- XSS
  - https://github.com/leizongmin/js-xss
  - https://github.com/AhmedAdelFahim/express-xss-sanitizer
  - https://github.com/jsonmaur/xss-clean
- [ ] HelmetJS
  - https://www.freecodecamp.org/learn/information-security/#information-security-with-helmetjs
  - https://nemethgergely.com/blog/nodejs-security-overview#using-the-helmet-module
  - https://blog.risingstack.com/node-js-security-checklist/
- [ ] Paginate GET /recipe
  - https://stackoverflow.com/questions/776448/pagination-in-a-rest-web-application
  - https://github.dev/hagopj13/node-express-boilerplate/blob/master/src/models/plugins/paginate.plugin.js
  - https://github.com/PacktPublishing/The-Complete-Node.js-Developer-Course-3rd-Edition-/tree/master/13.%20Sorting%2C%20Pagination%2C%20and%20Filtering%20(Task%20App) - https://www.packtpub.com/product/the-complete-node-js-developer-course/9781789955071
- [ ] Re-usable data validation middleware, instead of putting repetitive code at each RequestHandler
  - https://github.com/hagopj13/node-express-boilerplate/blob/master/src/middlewares/validate.js
  - https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/validation.md
  - https://github.com/platzi/curso-nodejs-postgres/blob/main/middlewares/validator.handler.js (uses joi)
- [ ] Swagger:
  - https://github.com/danielkhan/todolist-backend/blob/master/utils/swagger.js
  - https://github.com/hagopj13/node-express-boilerplate/blob/master/src/routes/v1/auth.route.js - Search for swagger
  - https://blog.logrocket.com/documenting-your-express-api-with-swagger/
  - https://www.manning.com/books/designing-apis-with-swagger-and-openapi
- [ ] Full text search of recipes
  - Use PostgreSQL's full-text search functionality to perform natural-language searches of your data. https://lets-go-further.alexedwards.net/
- [ ] Rate limit:
  - https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/login-rate-limit.md
  - Libraries:
    - https://github.com/nfriedly/express-rate-limit
    - https://github.com/tj/node-ratelimiter
    - https://github.com/animir/node-rate-limiter-flexible
  - With Redis:
    - https://github.com/guardian/gateway/tree/main/src/server/lib/rate-limit
    - https://github.dev/lesterfernandez/react-live-messenger/blob/master/packages/server/controllers/express/rateLimiter.js
- [ ] Database migrations
  - https://github.com/gjuchault/typescript-functional-service-starter/blob/main/src/infrastructure/database/migration.ts
  - (Sequelize) https://platzi.com/cursos/backend-nodejs-postgres/ - https://github.com/platzi/curso-nodejs-postgres/tree/production/db/migrations
- [ ] GitHub action to run backend tests on push

## Redis

- Curso de Node.js: Autenticación, Microservicios y Redis - https://platzi.com/cursos/nodejs-microservicios - https://github.com/CodingCarlos/proyecto-backend-node-platzi
- https://github.com/guardian/gateway/search?q=redis
- https://github.com/lesterfernandez/react-live-messenger/search?q=redisClient
- https://www.packtpub.com/product/node-js-web-development/9781838987572 - https://github.com/PacktPublishing/Node.js-Web-Development-Fifth-Edition
- https://github.com/CodingCarlos/proyecto-backend-node-platzi/blob/master/store/redis.js - https://platzi.com/cursos/nodejs-microservicios/
- https://news.ycombinator.com/item?id=33021424
  - We moved from jwt to opaque tokens and it's been fantastic. We also moved from using redis as our token store to using postgres (aurora).

## Front

- [ ] Add an error boundary
  - https://reactjs.org/docs/error-boundaries.html
- [ ] Footer add my name and link to source code
- [ ] Check navigation with keyboard at forms
- [ ] Why did you render: https://github.com/welldone-software/why-did-you-render
  - Setup requires many extra steps for Create React App :/
  - This alternative seems somewhat similar: https://github.com/shuding/tilg

## UI tests

- Introducción al Testing desde Cero con JEST - https://www.youtube.com/watch?v=_DzBez4qMi0&list=PLV8x_i1fqBw0Kn_fBIZTa3wS_VZAqddX7&index=11
- TESTING en REACT ¡Aprende DESDE CERO! Con react-testing-library y Jest- https://www.youtube.com/watch?v=KYjjtRgg_H0&list=PLV8x_i1fqBw0Kn_fBIZTa3wS_VZAqddX7&index=21
- https://github.com/midudev/pokedex-for-ci/tree/main/test

[ ] GitHub action to run UI tests on push

### UI tests with Cypress

- Aprende Testing en Cypress como lo hace un Senior en la vida real - https://www.youtube.com/watch?v=HDFNjDKKO6A&list=PLV8x_i1fqBw0Kn_fBIZTa3wS_VZAqddX7&index=22
- https://github.com/AJarombek/saints-xctf-web/tree/master/cypress
- https://www.coursera.org/search?query=cypress&

[ ] GitHub action to run Cypress tests on push - Important: see https://youtu.be/sIhm4YOMK6Q?t=2246 for how to do it - repo: https://github.com/midudev/pokedex-for-ci/blob/main/.github/workflows/pipeline.yml

## Deploy AWS

Resources:

- https://www.udemy.com/course/react-fullstack-with-nodeexpress-psql-and-aws/ - React, VPC, EC2, PM2
- Amazon EKS cluster using Terraform, ArgoCD - https://www.manning.com/liveproject/deploy-to-Amazon-Web-Services
- https://stackoverflow.com/questions/41250087/how-to-deploy-a-react-nodejs-express-application-to-aws
- Node.js Web Development - Fifth Edition – Docker Swarm AWS EC2 ECR Terraform - https://www.packtpub.com/product/node-js-web-development/9781838987572 - https://github.com/PacktPublishing/Node.js-Web-Development-Fifth-Edition

### EC2

- https://workshops.aws/?tag=EC2
- Deploy a Node.js Web App (uses Elastic Beanstalk) - https://aws.amazon.com/getting-started/hands-on/deploy-nodejs-web-app/
- Deploying a React/Node/MySQL app to Amazon EC2 (2022) - https://towardsdev.com/deploying-a-react-node-mysql-app-to-aws-ec2-2022-1dfc98496acf
- Deploying a Basic Express API on Amazon EC2 - https://betterprogramming.pub/deploying-a-basic-express-api-on-amazon-ec2-eea0b54a825
- https://www.pluralsight.com/courses/aws-managing-ec2-instances

### RDS

- https://cloudacademy.com/lab/create-your-first-amazon-rds-database/
- https://learn.acloud.guru/course/aws-rds/overview
- Migrating from PostgreSQL to Amazon RDS - https://www.amazon.com/Migrating-PostgreSQL-Database-Training-Certification/dp/B09HY8TQH7/ref=sr_1_86?qid=1665666086&s=courseware&sr=1-86
- Migrating from MySQL to Amazon RDS - https://www.amazon.com/Migrating-Amazon-Database-Training-Certification/dp/B09HY1YT5S/ref=sr_1_68?qid=1665665854&s=courseware&sr=1-68

### Host React app at S3/CloudFront

- [ ] Deploy with Terraform
  - https://www.karanpratapsingh.com/blog/deploy-react-s3-cloudfront
  - https://jarombek.com/blog/feb-15-2020-s3-react
- [ ] Deploy with CloudFormation
  - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/getting-started-secure-static-website-cloudformation-template.html - https://github.com/aws-samples/amazon-cloudfront-secure-static-site

Resources

- Deploy a Static Website to Amazon S3: https://www.manning.com/liveproject/deploy-a-static-website-to-amazon-s3
- https://frontendmasters.com/courses/aws-v2/ - Creates two S3 buckets
- https://www.edx.org/search?q=s3
- Automate react application deployment on aws, mohamed labouardy
  https://livevideo.manning.com/module/536_1_1/automate-react-application-deployment-on-aws-mohamed-labouardy/author-talk/automate-react-application-deployment-on-aws?

### Docker

- https://www.docker.com/blog/how-to-use-the-node-docker-official-image/
- https://cloudonaut.io/rapid-docker-on-aws/
- Docker in Motion - https://www.manning.com/livevideo/docker-in-motion
- https://github.com/platzi/curso-nodejs-auth/blob/13-step/docker-compose.yml
- https://github.com/hagopj13/node-express-boilerplate
- https://github.com/FaztWeb/pern-stack
- https://www.packtpub.com/product/restful-web-api-design-with-node-js-12-video/9781838648770 - https://github.com/PacktPublishing/RESTful-Web-API-Design-with-Node.js-12 - https://github.com/PacktPublishing/RESTful-Web-API-Design-with-Node.js-12-contact-api

### Terraform

- https://www.linkedin.com/feed/update/urn:li:activity:6985936585028444160/ - https://blog.gruntwork.io/a-comprehensive-guide-to-terraform-b3d32832baca
- https://developer.hashicorp.com/terraform/tutorials/aws-get-started (new) - https://learn.hashicorp.com/collections/terraform/aws-get-started (old)
- Introduction to Infrastructure as Code with Terraform - https://www.karanpratapsingh.com/blog/introduction-to-iac-terraform
- Terraform Basics: Automate Provisioning of AWS EC2 Instances - https://www.coursera.org/projects/terraform-devops-aws-cloud-iac-ec2
- Terraform for absolute beginners - https://www.coursera.org/projects/terraform-for-absolute-beginners
- https://github.com/AJarombek/global-aws-infrastructure
- https://github.com/AJarombek/jarombek-com-infrastructure
- https://github.com/AJarombek/saints-xctf-infrastructure

### CloudFormation

- https://www.linkedin.com/learning/aws-deployment-provisioning-and-automation/understand-aws-cloudformation?autoplay=true

### GitHub actions

- [] ESLint GitHub action on push

  - https://github.com/actions/starter-workflows/blob/main/code-scanning/eslint.yml
  - https://github.com/midudev/pokedex-for-ci/blob/main/.github/workflows/pipeline.yml#L20-L33

- GitHub Actions TUTORIAL Desde Cero - Integración continua (CI/CD) - https://www.youtube.com/watch?v=sIhm4YOMK6Q&list=PLV8x_i1fqBw0Kn_fBIZTa3wS_VZAqddX7&index=57
- Deploy a React App to Amazon S3 using GitHub Actions And Bitbucket Pipelines - https://blog.devgenius.io/deploy-a-react-app-to-amazon-s3-using-github-actions-and-bitbucket-pipelines-74791ae10a7c
- https://frontendmasters.com/courses/aws-v2/ - https://frontendmasters.com/courses/aws-v2/integrate-github-action/

### EKS

- https://workshops.aws/?tag=EKS
  - EKS Immersion Workshop - https://catalog.workshops.aws/eks-immersionday/en-US
  - https://www.eksworkshop.com
  - EKS Terraform Workshop - https://tf-eks-workshop.workshop.aws/
  - Web Application Hosts on EKS Workshop - https://catalog.us-east-1.prod.workshops.aws/workshops/a1101fcc-c7cf-4dd5-98c4-f599a65056d5/en-US
- Deploy a Container Web App on Amazon EKS - https://aws.amazon.com/getting-started/guides/deploy-webapp-eks
- https://www.coursera.org/learn/containerized-applications-on-aws
- Terraform infrastructure for building an EKS cluster. Infrastructure includes a VPC, EKS cluster, and EC2 worker nodes: https://github.com/AJarombek/global-aws-infrastructure/tree/master/eks
- Amazon EKS cluster using Terraform, ArgoCD - https://www.manning.com/liveproject/deploy-to-Amazon-Web-Services

## ArgoCD

- Amazon EKS cluster using Terraform, ArgoCD - https://www.manning.com/liveproject/deploy-to-Amazon-Web-Services

## Various

Read PDF 'JWT Handbook' from Auth0

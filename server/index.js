const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const router =require('./router')
const bodyParser = require('koa-bodyparser')
const helmet = require("koa-helmet")
const compress = require('koa-compress')
const logger = require('koa-logger')
const jwt=require('koa-jwt')
// const { koaJwtSecret } = require('jwks-rsa')
// const serve = require('koa-static');
// const serve = require('koa-session');

const app = new Koa()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = app.env !== 'production'

app
.use(logger())
.use(helmet())
.use(bodyParser())
.use(compress({
  filter: function (content_type) {
    return /text/i.test(content_type)
  },
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))
// .use(jwt({ secret: 'shared-secret' }))
// .use(jwt({ 
//   secret: koaJwtSecret({
//     jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
//     cache: true,
//     cacheMaxEntries: 5,
//     cacheMaxAge: ms('10h') 
//   }),
//   audience: 'http://myapi/protected',
//   issuer: 'http://issuer' 
// }))
.use(router.routes())
.use(router.allowedMethods())
    
    async function start () {
      // Instantiate nuxt.js
      const nuxt = new Nuxt(config)
      
      const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  app.use((ctx) => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })


  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()

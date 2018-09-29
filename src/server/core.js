import Koa from 'koa';
import koaBody from 'koa-body';
import koaCompress from 'koa-compress';
import session from 'koa-session';
import { server } from './config';
import router from './router';
import passport from './passport';
import { log } from './helper/logger';

class Server {
  constructor() {
    const app = new Koa();

    const sessionConfig = {
      maxAge: 60 * 60 * 1000, // expires 60min
    };

    app.keys = ['super-secret-key'];
    app.proxy = true;

    app.use(koaBody())
      .use(koaCompress())
      .use(session(sessionConfig, app))
      .use(passport.initialize())
      .use(passport.session())
      .use(router.routes())
      .use(router.allowedMethods());

    app.listen(server.port, '0.0.0.0');
    log(`cms is running, listening on 0.0.0.0:${server.port}`);

    return app;
  }
}

export default Server;

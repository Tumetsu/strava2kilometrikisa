import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import 'express-async-errors';
import mongoose from 'mongoose';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import { env, secrets } from './environment';
import HttpException from './helpers/exceptions';
import logger from './helpers/logger';
import { isDev } from './helpers/helpers';

// Controllers
import Home from './controllers/Home';
import Kilometrikisa from './controllers/Kilometrikisa';
import StravaAuth from './controllers/StravaAuth';
import Sync from './controllers/Sync';
import strava from 'strava-v3';

// Extend Express request typings with session data
declare module 'express-session' {
  export interface SessionData {
    stravaUserId: number | null;
    stravaToken: string | null;
    kilometrikisaToken: string | null;
    kilometrikisaSessionId: string | null;
  }
}

export async function getApp() {
  const app = express();
  const MongoStore = connectMongo(session);

  strava.config({
    access_token: secrets.stravaAccessToken,
    client_id: secrets.stravaClientId,
    client_secret: secrets.stravaClientSecret,
    redirect_uri: env.stravaRedirectUri,
  });

  // Serve static files.
  app.use('/img', express.static(path.join(__dirname, '../app/assets/img')));
  app.use('/dist', express.static(path.join(__dirname, '../app/assets/dist')));

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  // parse application/json
  app.use(bodyParser.json());

  // set out template engine
  app.set('views', __dirname + '/../app/views');
  app.set('view engine', 'ejs');

  // Enforce SSL on production
  if (!isDev()) {
    app.enable('trust proxy');
    app.use(function (req, res, next) {
      if (process.env.NODE_ENV != 'development' && !req.secure) {
        return res.redirect('https://' + req.headers.host + req.url);
      }
      next();
    });
  }

  // Init sessions.
  app.use(
    session({
      secret: secrets.kilometrikisaSessionSecret,
      saveUninitialized: true,
      resave: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    }),
  );

  /**
   * Add extra options for all templates to render.
   */
  app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session?.stravaUserId;
    next();
  });

  //lets start a server and listens on port 3000 for connections
  app.listen(env.port, () => {
    logger.info(`Server listening on http://localhost:${env.port}`);
  });

  //some basic routes to controllers
  app.get('/', (req: Request, res: Response) => {
    StravaAuth.auth(req, res);
  });

  app.get('/faq', (req: Request, res: Response) => {
    Home.faq(req, res);
  });

  // Application flow:

  // 1. Home: Information about the app.

  // 2. Strava authentication.
  app.get('/strava/auth', (req: Request, res: Response) => {
    return StravaAuth.auth(req, res);
  });

  // 2. Strava authentication ok.
  app.get('/strava/authcomplete', (req: Request, res: Response) => {
    return StravaAuth.authComplete(req, res);
  });

  // 3. Kilometrikisa authentication.
  app.get('/kilometrikisa/auth', (req: Request, res: Response) => {
    Kilometrikisa.auth(req, res);
  });

  // 4. Kilometrikisa authentication.
  app.post('/kilometrikisa/authhandler', (req: Request, res: Response) => {
    return Kilometrikisa.authHandler(req, res);
  });

  // 5. Success page!
  app.get('/account', (req: Request, res: Response) => {
    return Sync.index(req, res);
  });

  // Manual sync.
  app.get('/manualsync', (req: Request, res: Response) => {
    return Sync.manualSyncPreview(req, res);
  });

  // Manual sync.
  app.get('/dosync', (req: Request, res: Response) => {
    return Sync.manualSync(req, res);
  });

  // Enable autosync.
  app.get('/enableautosync', (req: Request, res: Response) => {
    return Sync.enableAutosync(req, res);
  });

  // Disable autosync.
  app.get('/disableautosync', (req: Request, res: Response) => {
    return Sync.disableAutosync(req, res);
  });

  // Enable e-bike sync.
  app.get('/enableebike', (req: Request, res: Response) => {
    return Sync.enableEBikeSync(req, res);
  });

  // Disable e-bike sync.
  app.get('/disableebike', (req: Request, res: Response) => {
    return Sync.disableEBikeSync(req, res);
  });

  // isAuthenticated
  app.get('/isauthenticated', (req: Request, res: Response) => {
    return Sync.isAuthenticated(req, res);
  });

  // Log out.
  app.get('/logout', (req: Request, res: Response) => {
    return Home.logout(req, res);
  });

  // catch 404 and forward to error handler
  app.use(function (req: Request, res: Response, next: NextFunction) {
    next(new HttpException(404, 'Not Found'));
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (isDev()) {
    app.use(function (err: HttpException, req: Request, res: Response) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err: HttpException, req: Request, res: Response) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
    });
  });
  return app;
}

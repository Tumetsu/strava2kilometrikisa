import { Request, Response } from 'express';
import { findUser } from '../models/UserModel';

export default {
  faq: function (req: Request, res: Response) {
    //need to put these behind http auth or something
    res.render('faq', {});
  },
  delete: async function (req: Request, res: Response) {
    try {
      const user = await findUser({ stravaUserId: req.session.stravaUserId as number });
      await user.delete();
      this.logout(req, res);
    } catch {
      res.redirect('/?error=usernotfound');
    }
  },
  logout: function (req: Request, res: Response) {
    req.session.stravaUserId = null;
    req.session.stravaToken = null;
    req.session.kilometrikisaToken = null;
    req.session.kilometrikisaSessionId = null;
    res.redirect('/');
  },
};

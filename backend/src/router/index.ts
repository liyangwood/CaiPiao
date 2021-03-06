import {Request, Response, NextFunction, Router} from 'express'
import db from '../db'
// import {utilCrypto} from '../utility'
import * as moment from 'moment'

import ping from './ping';
import ssq from './ssq';



/**
 * Every request intercepts the token and sets the session user from the userId again
 *
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 * @returns {boolean}
 */
export const middleware = async (req: Request, res: Response, next: NextFunction) => {
    // check token
    const token = req.headers['api-token']
    const DB = await db.create()

    if (token) {
        // const json = JSON.parse(utilCrypto.decrypt(token.toString()))
        // if (json.userId && json.expired && (json.expired - moment().unix() > 0)) {
        //     try {
        //         const user = await DB.getModel('User').findOne({_id: json.userId})
        //         // TODO: find better way to not send the salt back to the front-end
        //         delete user._doc.salt

        //         if (user) {
        //             req['session'].user = user
        //             req['session'].userId = user.id
        //         }
        //     } catch (err) {
        //         console.log('err happened: ', err)
        //     }
        // }
    } else if (req['session'].userId) {
        // check session
        const session = req['session']
        try {
            const user = await DB.getModel('User').findOne({_id: session.userId})

            if (user) {
                req['session'].user = user
            }
        } catch (err) {
            console.log('err happened: ', err)
        }
    }
    next()
}

const router = Router()

router.use('/ping', ping);
router.use('/ssq', ssq);


router.use((req, res) => {
    return res.sendStatus(403)
})

export default router
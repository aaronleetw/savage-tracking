import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { setLastRfid } from '~/utils/rfid'
 
type ResponseData = {
  message: string
}
 
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
    if ("uid" in req.body) {
        try {
            z.string().regex(/^[0-9a-f]{8}$/i).parse(req.body.uid)
        } catch (e) {
            res.status(200).json({ message: 'Invalid UID!' })
            return
        }
        setLastRfid(req.body.uid)
        res.status(200).json({ message: 'Received!' })
    }
    else {
        res.status(200).json({ message: 'No UID!' })
    }
}

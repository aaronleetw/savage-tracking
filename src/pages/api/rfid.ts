import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { appRouter } from '~/server/api/root'
import { rfidAttendance, setLastRfid } from '~/utils/rfid'
import { db } from '~/server/db'
import { env } from 'process'
 
type ResponseData = {
    status: string,
    name?: string
}
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
    if (!req.body || !("key" in req.body) || !(req.body.key === process.env.RFID_PKEY)) {
        res.status(403).json({ status: 'ERR_BADKEY' });
        return;
    }
    else if ("uid" in req.body) {
        try {
            z.string().regex(/^[0-9a-f]{8}$/i).parse(req.body.uid);
        } catch (e) {
            res.status(200).json({ status: 'ERR_BADUID' });
            return;
        }
        setLastRfid(req.body.uid);
        if (rfidAttendance) {
            const caller = appRouter.createCaller({ session: undefined, db, req, res });
            try {
                const resp = await caller.admin.rfidAttendance({ rfid: req.body.uid, key: req.body.key });
                res.status(200).json(resp);
            } catch (e) {
                res.status(500).json({ status: "ERR_INTERNAL" });
                return;
            }
        } else {
            res.status(202).json({ status: 'RFID_ATTENDANCE_NOT_ENABLED' });
        }
    }
    else {
        res.status(400).json({ status: 'ERR_NOUID' });
    }
}

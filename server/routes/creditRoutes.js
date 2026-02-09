import express from 'express'
import {getplans, purchaseplan} from '../controller/creditController.js'
import { protect } from '../middlewares/auth.js'

const creditRouter = express.Router()

creditRouter.get('/plan',getplans)
creditRouter.post('/purchase',protect,purchaseplan)

export default creditRouter
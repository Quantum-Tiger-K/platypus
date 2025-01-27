import { Request, Response, NextFunction } from 'express'

import { ExceptionBase, SerializedException } from '../../../../libs/exceptions/exception-base'
import { UnauthorizedException } from '../../../../libs/exceptions/unauthorized-exception'
import { logger } from '../../../../libs/logger/logger'

import { Syllabus } from '../../domain/syllabus'
import { CreateSyllabusHttpRequest } from './create-syllabus-dto'
import { CreateSyllabusService } from './create-syllabus-service'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CreateSyllabusController = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.acceptedPolicies) {
    const error = new UnauthorizedException()
    res.status(error.code)
    return res.json(error)
  }

  const { body } = req
  const userId = req.user.id

  const syllabus = new CreateSyllabusHttpRequest({ ...body, ownerList: [userId] })

  let response: Syllabus | SerializedException
  try {
    await syllabus.validate()
    response = await CreateSyllabusService.execute(syllabus)
  } catch (error) {
    if (error instanceof ExceptionBase) {
      res.status(error.code)
      response = error.toJSON()
    } else {
      res.status(500)
      response = error as any
    }
    logger.error(response)
  }

  return res.json(response)
}

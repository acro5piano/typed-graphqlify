import { expectType } from 'tsd'
import { params, types } from '../dist'

const queryObject = {
  user: params(
    { id: 1 },
    {
      id: types.number,
      name: types.string,
      bankAccount: {
        id: types.number,
        branch: types.string,
      },
    },
  ),
}

type ExpectedType = {
  user: {
    id: number
    name: string
    bankAccount: {
      id: number
      branch: string
    }
  }
}

expectType<ExpectedType>(queryObject)

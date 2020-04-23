import { expectType } from 'tsd'
import { params, types } from '../dist'

{
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
}

{
  const UserType = ['Student', 'Teacher'] as const

  type UserType = typeof UserType[number]

  const queryObject = {
    user: {
      id: types.number,
      type: types.oneOf(UserType),
    },
  }

  type ExpectedType = {
    user: {
      id: number
      type: UserType
    }
  }

  expectType<ExpectedType>(queryObject)
}

{
  const userType = {
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
  } as const

  type UserType = typeof userType[keyof typeof userType]

  const queryObject = {
    user: {
      id: types.number,
      type: types.oneOf(userType),
    },
  }

  type ExpectedType = {
    user: {
      id: number
      type: UserType
    }
  }

  expectType<ExpectedType>(queryObject)
}

import { expectType, expectError } from 'tsd'
import { params, types } from '../dist'

/*
 * Basic object
 */
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

/*
 * Enum array
 */
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

/*
 * Enum object
 */
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

/*
 * Optional
 */
{
  const queryObject = {
    user: {
      id: types.number,
      name: types.optional.string,
    },
  }

  type ExpectedType = {
    user: {
      id: number
      name: string | undefined
    }
  }

  expectType<ExpectedType>(queryObject)

  type UnexpectedType = {
    user: {
      id: number
      name: string
    }
  }

  expectError<UnexpectedType>(queryObject)
}

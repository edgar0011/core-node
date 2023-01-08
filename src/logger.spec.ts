type Message = {
  from: string
  to: string
  subject: string
  type: number
  text: string
}

type Log = (message: Message) => void
type LogMock = { mock: { calls: number } }

type ILogger = {
  log: Log | LogMock
}

// ----------------------------------------------------------------------

const props: { message: Message } = {
  message: {
    from: 'Karel',
    to: 'Nadezda',
    subject: 'Hello',
    type: 0,
    text: 'This my hello to you, Nadezda. Regards, Karel',
  },
}

const sayHello = (logger: ILogger) => {
  if (typeof logger.log === 'function') {
    logger.log(props.message)
  }
}

// Tests

it('says HELLO', () => {
  const mockLogger: ILogger = {
    log: jest.fn(),
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mockedCall = sayHello(mockLogger) // eslint-disable-line

  console.log(mockLogger.log) // eslint-disable-line
  if (typeof mockLogger.log !== 'function') {
    console.log(mockLogger.log.mock) // eslint-disable-line
    console.log(mockLogger.log.mock.calls) // eslint-disable-line
  }

  expect(mockLogger.log).toHaveBeenCalledWith(props.message)
})

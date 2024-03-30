export const BaseQueue = {
  logger: jest.fn(),
  queue: jest.fn(),
  addJob: jest.fn(),
  processJob: jest.fn()
};

export const AuthQueue = {
  ...BaseQueue,
  addAuthUserJob: jest.fn()
};

export const UserQueue = {
  ...BaseQueue,
  addUserJob: jest.fn()
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomError } from '@globals/helpers/error-handler';
import { authMock, authMockRequest, authMockResponse, mergedAuthAndUserData } from '@root/mocks/auth.mock';
import { Request, Response } from 'express';
import { signInController } from '../signin.controller';
import { authService } from '@services/db/auth.service';
import { firstLetterUppercase } from '@globals/helpers/utils';
import { userService } from '@services/db/user.service';

const USERNAME = 'Manny';
const PASSWORD = 'manny1';
const WRONG_USERNAME = 'ma';
const WRONG_PASSWORD = 'ma';
const LONG_PASSWORD = 'mathematics1';
const LONG_USERNAME = 'mathematics';

jest.useFakeTimers();
jest.mock('@services/queue/base.queue');

describe('SignIn', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest({}, { username: '', password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    signInController.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: WRONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    signInController.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: LONG_USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    signInController.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: '' }) as Request;
    const res: Response = authMockResponse();
    signInController.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: WRONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    signInController.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: LONG_PASSWORD }) as Request;
    const res: Response = authMockResponse();
    signInController.signIn(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw "Invalid credentials" if username does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthByUsername').mockResolvedValueOnce(null as any);

    signInController.signIn(req, res).catch((error: CustomError) => {
      expect(authService.getAuthByUsername).toHaveBeenCalledWith(firstLetterUppercase(req.body.username));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should throw "Invalid credentials" if password does not exist', () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthByUsername').mockResolvedValueOnce(null as any);

    signInController.signIn(req, res).catch((error: CustomError) => {
      expect(authService.getAuthByUsername).toHaveBeenCalledWith(firstLetterUppercase(req.body.username));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    authMock.comparePassword = () => Promise.resolve(true);
    jest.spyOn(authService, 'getAuthByUsername').mockResolvedValue(authMock);
    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(mergedAuthAndUserData);

    await signInController.signIn(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User login successfully',
      user: mergedAuthAndUserData,
      token: req.session?.jwt
    });
  });
});

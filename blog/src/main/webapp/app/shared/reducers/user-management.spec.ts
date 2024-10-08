import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import sinon from 'sinon';

import userManagement, { getUsers } from 'app/shared/reducers/user-management';

describe('User management reducer tests', () => {
  const initialState = {
    users: [],
    errorMessage: null,
  };

  describe('Common', () => {
    it('should return the initial state', () => {
      expect(userManagement(undefined, { type: 'unknown' })).toEqual({ ...initialState });
    });
  });

  describe('Failures', () => {
    it('should set state to failed and put an error message in errorMessage', () => {
      expect(
        userManagement(undefined, {
          type: getUsers.rejected.type,
          payload: 'something happened',
          error: { message: 'error happened' },
        }),
      ).toEqual({ ...initialState, errorMessage: 'error happened' });
    });
  });

  describe('Success', () => {
    it('should update state according to a successful fetch users request', () => {
      const payload = { data: 'some handsome users' };
      const toTest = userManagement(undefined, { type: getUsers.fulfilled.type, payload });
      expect(toTest).toMatchObject({
        users: payload.data,
      });
    });
  });

  describe('Actions', () => {
    let store;

    const resolvedObject = { value: 'whatever' };
    const getState = jest.fn();
    const dispatch = jest.fn();
    const extra = {};
    beforeEach(() => {
      store = configureStore({
        reducer: (state = [], action) => [...state, action],
      });
      axios.get = sinon.stub().returns(Promise.resolve(resolvedObject));
    });

    it('dispatches FETCH_USERS_PENDING and FETCH_USERS_FULFILLED actions', async () => {
      const arg = {};

      const result = await getUsers(arg)(dispatch, getState, extra);

      const pendingAction = dispatch.mock.calls[0][0];
      expect(pendingAction.meta.requestStatus).toBe('pending');
      expect(getUsers.fulfilled.match(result)).toBe(true);
    });

    it('dispatches FETCH_USERS_PENDING and FETCH_USERS_FULFILLED actions with pagination options', async () => {
      const arg = { page: 1, size: 20, sort: 'id,desc' };

      const result = await getUsers(arg)(dispatch, getState, extra);

      const pendingAction = dispatch.mock.calls[0][0];
      expect(pendingAction.meta.requestStatus).toBe('pending');
      expect(getUsers.fulfilled.match(result)).toBe(true);
    });
  });
});

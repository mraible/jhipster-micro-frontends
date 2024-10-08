import axios from 'axios';
import sinon from 'sinon';
import { configureStore } from '@reduxjs/toolkit';

import authentication, {
  authError,
  clearAuth,
  clearAuthentication,
  getAccount,
  initialState,
  logoutServer,
} from 'app/shared/reducers/authentication';

describe('Authentication reducer tests', () => {
  function isAccountEmpty(state): boolean {
    return Object.keys(state.account).length === 0;
  }

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const toTest = authentication(undefined, { type: '' });
      expect(toTest).toMatchObject({
        loading: false,
        isAuthenticated: false,
        errorMessage: null, // Errors returned from server side
        redirectMessage: null,
      });
      expect(isAccountEmpty(toTest));
    });
  });

  describe('Success', () => {
    it('should detect a success on get session and be authenticated', () => {
      const payload = { data: { activated: true } };
      const toTest = authentication(undefined, { type: getAccount.fulfilled.type, payload });
      expect(toTest).toMatchObject({
        isAuthenticated: true,
        loading: false,
        account: payload.data,
      });
    });

    it('should detect a success on get session and not be authenticated', () => {
      const payload = { data: { activated: false } };
      const toTest = authentication(undefined, { type: getAccount.fulfilled.type, payload });
      expect(toTest).toMatchObject({
        isAuthenticated: false,
        loading: false,
        account: payload.data,
      });
    });
  });

  describe('Failure', () => {
    it('should detect a failure', () => {
      const error = { message: 'Something happened.' };
      const toTest = authentication(undefined, { type: getAccount.rejected.type, error });

      expect(toTest).toMatchObject({
        loading: false,
        isAuthenticated: false,
        errorMessage: error.message,
      });
      expect(isAccountEmpty(toTest));
    });
  });

  describe('Other cases', () => {
    it('should properly reset the current state when a logout is requested', () => {
      const payload = { data: { logoutUrl: 'http://localhost:8080/logout' } };
      const toTest = authentication(undefined, { type: logoutServer.fulfilled.type, payload });
      expect(toTest).toMatchObject({
        loading: false,
        isAuthenticated: false,
        errorMessage: null,
        redirectMessage: null,
      });
      expect(isAccountEmpty(toTest));
    });

    it('should properly define an error message and change the current state to display the login modal', () => {
      const message = 'redirect me please';
      const toTest = authentication(undefined, authError(message));
      expect(toTest).toMatchObject({
        loading: false,
        isAuthenticated: false,
        errorMessage: null,
        redirectMessage: message,
      });
      expect(isAccountEmpty(toTest));
    });

    it('should clear authentication', () => {
      const toTest = authentication({ ...initialState, isAuthenticated: true }, clearAuth());
      expect(toTest).toMatchObject({
        loading: false,
        isAuthenticated: false,
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

    it('dispatches GET_SESSION_PENDING and GET_SESSION_FULFILLED actions', async () => {
      const result = await getAccount()(dispatch, getState, extra);

      const pendingAction = dispatch.mock.calls[0][0];
      expect(pendingAction.meta.requestStatus).toBe('pending');
      expect(getAccount.fulfilled.match(result)).toBe(true);
    });

    it('dispatches LOGOUT actions', async () => {
      axios.post = sinon.stub().returns(Promise.resolve({}));

      const result = await logoutServer()(dispatch, getState, extra);

      const pendingAction = dispatch.mock.calls[0][0];
      expect(pendingAction.meta.requestStatus).toBe('pending');
      expect(logoutServer.fulfilled.match(result)).toBe(true);
    });

    it('dispatches CLEAR_AUTH actions', async () => {
      await store.dispatch(clearAuthentication('message'));
      expect(store.getState()).toEqual([expect.any(Object), expect.objectContaining(authError('message')), clearAuth()]);
    });
  });
});

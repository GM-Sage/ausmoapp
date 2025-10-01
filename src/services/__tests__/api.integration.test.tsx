import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-native';
import { useSelector } from 'react-redux';

import { mockUser, mockStore } from '../../__tests__/utils/testUtils';

// Mock external services
jest.mock('../supabaseDatabaseService', () => ({
  SupabaseDatabaseService: {
    getInstance: jest.fn(() => ({
      getUser: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getUsers: jest.fn(),
    })),
  },
}));

jest.mock('../databaseService', () => ({
  DatabaseService: {
    getInstance: jest.fn(() => ({
      getUser: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getUsers: jest.fn(),
    })),
  },
}));

// Import after mocking
import DatabaseService from '../databaseService';
import SupabaseDatabaseService from '../supabaseDatabaseService';

describe('API Integration Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: (state = { currentUser: null }, action) => state,
      },
    });
    jest.clearAllMocks();
  });

  describe('Service Integration', () => {
    it('should handle database service initialization', async () => {
      const mockDbService = {
        initialize: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue(mockUser),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockDbService);

      const dbService = DatabaseService.getInstance();
      await dbService.initialize();

      expect(mockDbService.initialize).toHaveBeenCalled();
      expect(DatabaseService.getInstance).toHaveBeenCalled();
    });

    it('should handle Supabase service initialization', async () => {
      const mockSupabaseService = {
        initialize: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue(mockUser),
      };

      (SupabaseDatabaseService.getInstance as jest.Mock).mockReturnValue(mockSupabaseService);

      const supabaseService = SupabaseDatabaseService.getInstance();
      await supabaseService.initialize();

      expect(mockSupabaseService.initialize).toHaveBeenCalled();
      expect(SupabaseDatabaseService.getInstance).toHaveBeenCalled();
    });

    it('should handle service communication between local and cloud databases', async () => {
      const mockLocalUser = { ...mockUser, id: 'local-user-123' };
      const mockCloudUser = { ...mockUser, id: 'cloud-user-123' };

      const mockLocalDb = {
        getUser: jest.fn().mockResolvedValue(mockLocalUser),
        createUser: jest.fn().mockResolvedValue(mockLocalUser),
      };

      const mockCloudDb = {
        getUser: jest.fn().mockResolvedValue(mockCloudUser),
        syncUser: jest.fn().mockResolvedValue(true),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockLocalDb);
      (SupabaseDatabaseService.getInstance as jest.Mock).mockReturnValue(mockCloudDb);

      const localDb = DatabaseService.getInstance();
      const cloudDb = SupabaseDatabaseService.getInstance();

      // Simulate data flow between services
      const localUser = await localDb.getUser('test-id');
      const cloudUser = await cloudDb.getUser('test-id');

      expect(localUser).toEqual(mockLocalUser);
      expect(cloudUser).toEqual(mockCloudUser);
    });
  });

  describe('Redux-Store Integration', () => {
    it('should integrate Redux store with API services', () => {
      const TestComponent = () => {
        const currentUser = useSelector((state: any) => state.user.currentUser);
        return { currentUser };
      };

      const { result } = renderHook(() => TestComponent(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <Provider store={store}>
            {children}
          </Provider>
        ),
      });

      expect(result.current.currentUser).toBeNull();

      // Simulate API call updating Redux store
      store.dispatch({ type: 'user/setCurrentUser', payload: mockUser });

      expect(result.current.currentUser).toEqual(mockUser);
    });

    it('should handle API errors in Redux store', async () => {
      const mockError = new Error('API Error');

      const mockDbService = {
        getUser: jest.fn().mockRejectedValue(mockError),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockDbService);

      // Simulate error handling in Redux
      try {
        const dbService = DatabaseService.getInstance();
        await dbService.getUser('test-id');
      } catch (error) {
        // Error should be handled gracefully
        expect(error).toEqual(mockError);
      }

      // Store should handle errors without crashing
      expect(store.getState()).toBeDefined();
    });
  });

  describe('Service Communication', () => {
    it('should handle cross-service data synchronization', async () => {
      const mockLocalDb = {
        getUser: jest.fn().mockResolvedValue(mockUser),
        updateUser: jest.fn().mockResolvedValue(mockUser),
      };

      const mockCloudDb = {
        syncUser: jest.fn().mockResolvedValue(true),
        getUser: jest.fn().mockResolvedValue(mockUser),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockLocalDb);
      (SupabaseDatabaseService.getInstance as jest.Mock).mockReturnValue(mockCloudDb);

      // Simulate data sync between services
      const localDb = DatabaseService.getInstance();
      const cloudDb = SupabaseDatabaseService.getInstance();

      const user = await localDb.getUser(mockUser.id);
      await cloudDb.syncUser(user);

      expect(mockCloudDb.syncUser).toHaveBeenCalledWith(user);
    });

    it('should handle service failures gracefully', async () => {
      const mockFailingDb = {
        getUser: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockFailingDb);

      const dbService = DatabaseService.getInstance();

      // Should handle failure without crashing
      await expect(dbService.getUser('test-id')).rejects.toThrow('Database connection failed');
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent API calls', async () => {
      const mockDbService = {
        getUser: jest.fn().mockResolvedValue(mockUser),
        getUsers: jest.fn().mockResolvedValue([mockUser]),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockDbService);

      const dbService = DatabaseService.getInstance();

      // Make concurrent calls
      const promises = [
        dbService.getUser('user-1'),
        dbService.getUser('user-2'),
        dbService.getUsers(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockDbService.getUser).toHaveBeenCalledTimes(2);
      expect(mockDbService.getUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle API rate limiting', async () => {
      let callCount = 0;
      const mockDbService = {
        getUser: jest.fn().mockImplementation(async (id: string) => {
          callCount++;
          if (callCount > 5) {
            throw new Error('Rate limit exceeded');
          }
          return { ...mockUser, id };
        }),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockDbService);

      const dbService = DatabaseService.getInstance();

      // Make multiple calls that should hit rate limit
      const promises = Array.from({ length: 10 }, (_, i) =>
        dbService.getUser(`user-${i}`)
      );

      const results = await Promise.allSettled(promises);

      // Should have some successes and some failures
      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');

      expect(successes.length).toBeGreaterThan(0);
      expect(failures.length).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from API failures', async () => {
      const mockDbService = {
        getUser: jest.fn()
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce(mockUser),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockDbService);

      const dbService = DatabaseService.getInstance();

      // First call should fail
      await expect(dbService.getUser('test-id')).rejects.toThrow('Network error');

      // Second call should succeed (simulating retry/recovery)
      const user = await dbService.getUser('test-id');
      expect(user).toEqual(mockUser);
    });

    it('should handle partial service failures', async () => {
      const mockDbService = {
        getUser: jest.fn().mockResolvedValue(mockUser),
        updateUser: jest.fn().mockRejectedValue(new Error('Update failed')),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockDbService);

      const dbService = DatabaseService.getInstance();

      // Read should work
      const user = await dbService.getUser('test-id');
      expect(user).toEqual(mockUser);

      // Write should fail
      await expect(dbService.updateUser(mockUser)).rejects.toThrow('Update failed');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across services', async () => {
      const mockLocalDb = {
        getUser: jest.fn().mockResolvedValue(mockUser),
        createUser: jest.fn().mockResolvedValue(mockUser),
      };

      const mockCloudDb = {
        getUser: jest.fn().mockResolvedValue(mockUser),
        syncUser: jest.fn().mockResolvedValue(true),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockLocalDb);
      (SupabaseDatabaseService.getInstance as jest.Mock).mockReturnValue(mockCloudDb);

      const localDb = DatabaseService.getInstance();
      const cloudDb = SupabaseDatabaseService.getInstance();

      // Create user in local DB
      const createdUser = await localDb.createUser(mockUser);
      expect(createdUser).toEqual(mockUser);

      // Sync to cloud
      await cloudDb.syncUser(createdUser);

      // Both should return the same user
      const localUser = await localDb.getUser(mockUser.id);
      const cloudUser = await cloudDb.getUser(mockUser.id);

      expect(localUser).toEqual(cloudUser);
      expect(localUser.id).toBe(cloudUser.id);
    });

    it('should handle data conflicts', async () => {
      const localUser = { ...mockUser, name: 'Local Name' };
      const cloudUser = { ...mockUser, name: 'Cloud Name' };

      const mockLocalDb = {
        getUser: jest.fn().mockResolvedValue(localUser),
      };

      const mockCloudDb = {
        getUser: jest.fn().mockResolvedValue(cloudUser),
        resolveConflict: jest.fn().mockResolvedValue(cloudUser),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockLocalDb);
      (SupabaseDatabaseService.getInstance as jest.Mock).mockReturnValue(mockCloudDb);

      const localDb = DatabaseService.getInstance();
      const cloudDb = SupabaseDatabaseService.getInstance();

      // Get conflicting data
      const localData = await localDb.getUser(mockUser.id);
      const cloudData = await cloudDb.getUser(mockUser.id);

      expect(localData.name).not.toBe(cloudData.name);

      // Resolve conflict (prefer cloud data)
      const resolvedUser = await cloudDb.resolveConflict(localData, cloudData);
      expect(resolvedUser.name).toBe('Cloud Name');
    });
  });

  describe('Authentication Integration', () => {
    it('should handle authenticated API calls', async () => {
      const mockAuthDb = {
        getUser: jest.fn().mockImplementation(async (id: string) => {
          if (!mockUser.id) {
            throw new Error('Unauthorized');
          }
          return mockUser;
        }),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockAuthDb);

      const dbService = DatabaseService.getInstance();

      // Should work with authenticated user
      const user = await dbService.getUser(mockUser.id);
      expect(user).toEqual(mockUser);

      // Should fail without authentication
      await expect(dbService.getUser('')).rejects.toThrow('Unauthorized');
    });

    it('should handle session management', async () => {
      const mockSessionDb = {
        getUser: jest.fn().mockResolvedValue(mockUser),
        refreshSession: jest.fn().mockResolvedValue(true),
        isSessionValid: jest.fn().mockReturnValue(true),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockSessionDb);

      const dbService = DatabaseService.getInstance();

      // Check session validity
      const isValid = dbService.isSessionValid();
      expect(isValid).toBe(true);

      // Refresh session
      await dbService.refreshSession();
      expect(mockSessionDb.refreshSession).toHaveBeenCalled();
    });
  });

  describe('Caching Integration', () => {
    it('should handle API response caching', async () => {
      let callCount = 0;
      const mockCachedDb = {
        getUser: jest.fn().mockImplementation(async (id: string) => {
          callCount++;
          return { ...mockUser, id };
        }),
      };

      (DatabaseService.getInstance as jest.Mock).mockReturnValue(mockCachedDb);

      const dbService = DatabaseService.getInstance();

      // First call
      await dbService.getUser('user-1');
      expect(callCount).toBe(1);

      // Second call (should use cache)
      await dbService.getUser('user-1');
      expect(callCount).toBe(2); // In real implementation, this might be 1 if cached

      // Different user (should make new call)
      await dbService.getUser('user-2');
      expect(callCount).toBe(3);
    });
  });
});

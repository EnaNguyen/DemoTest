"use client";
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@/app/types";
import mockData from "@/app/data/mockData.json";

interface UserState {
  users: User[];
}

type UserAction =
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string };

interface UserContextValue extends UserState {
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u
        ),
      };
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((u) => u._id !== action.payload),
      };
    default:
      return state;
  }
};

const initialState: UserState = {
  users: (mockData.mockUsers as User[]) || [],
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const addUser = useCallback((user: User) => {
    dispatch({ type: "ADD_USER", payload: user });
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    const user = state.users.find((u) => u._id === id);
    if (user) {
      dispatch({ type: "UPDATE_USER", payload: { ...user, ...updates } });
    }
  }, [state.users]);

  const deleteUser = useCallback((id: string) => {
    dispatch({ type: "DELETE_USER", payload: id });
  }, []);

  const getUserById = useCallback((id: string) => {
    return state.users.find((u) => u._id === id);
  }, [state.users]);

  return (
    <UserContext.Provider
      value={{
        users: state.users,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUsers(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}
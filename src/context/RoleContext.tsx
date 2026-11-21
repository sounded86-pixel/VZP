import { createContext, useContext } from 'react';

export interface RoleContextType {
  currentRole: string;
  setCurrentRole: (role: string) => void;
  isAdmin: boolean;
  isDeveloper: boolean;
}

export const RoleContext = createContext<RoleContextType>({
  currentRole: 'resident',
  setCurrentRole: () => {},
  isAdmin: false,
  isDeveloper: false,
});

export const useRole = () => useContext(RoleContext);

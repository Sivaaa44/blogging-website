// src/types/auth.ts
export interface SignupFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface LoginFormData {
    email: string;
    password: string;
  }
  
  export interface UserData {
    id: string;
    username: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: UserData;
  }
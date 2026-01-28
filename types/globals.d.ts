export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      role?: string;
      institution?: string;
      organization?: string;
    };
  }
}

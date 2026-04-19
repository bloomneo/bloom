/**
 * Welcome Feature Type Definitions - Shared interfaces and types
 * @file src/api/features/welcome/welcome.types.ts
 *
 * @llm-rule WHEN: Need type safety for welcome feature data structures
 * @llm-rule AVOID: Defining types inline - reduces reusability and consistency
 * @llm-rule NOTE: Shared across service and route layers for type consistency
 */

export interface WelcomeResponse {
  message: string;
  timestamp: string;
}

export interface PersonalizedWelcomeResponse extends WelcomeResponse {
  name: string;
}
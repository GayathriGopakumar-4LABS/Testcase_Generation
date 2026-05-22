export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface TestCase {
  test_case_id?: string;
  requirement_id?: string;
  title: string;
  scenario?: string;
  preconditions: string;
  steps: string[];
  test_data?: string;
  expected_result: string;
  priority: "High" | "Medium" | "Low";
  test_type: string;
  actual_result?: string;
  status?: string;
  defect_id?: string;
  defect_status?: string;
  build_version?: string;
  remarks?: string;
}

export interface Generation {
  id: string;
  title: string;
  requirement: string;
  test_type: string;
  test_cases: TestCase[];
  test_case_count: number;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface GenerationListItem {
  id: string;
  title: string;
  test_type: string;
  test_case_count: number;
  project_id: string;
  created_at: string;
}

export type TestType =
  | "Functional"
  | "Integration"
  | "Unit"
  | "E2E"
  | "Performance"
  | "Security";

export interface ApiError {
  detail: string;
}

export interface GenerationCreatePayload {
  title: string;
  requirement: string;
  test_type: string;
  project_id: string;
}

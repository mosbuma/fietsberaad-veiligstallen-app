export enum TestStatus {
  NotExecuted = "not_executed",
  Success = "success",
  Failed = "failed"
}

export interface TestResult {
  name: string;
  status: TestStatus;
  message: string;
  details?: any;
}

export interface TestResponse {
  success: boolean;
  tests: TestResult[];
}

export interface ApiTestSection {
  name: string;
  endpoint: string;
  expanded: boolean;
  results: TestResponse | null;
  error: string | null;
  isLoading: boolean;
}

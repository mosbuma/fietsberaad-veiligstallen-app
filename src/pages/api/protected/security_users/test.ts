import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession, makeApiCall } from "~/utils/server/database-tools";
import type { TestResult, TestResponse } from "~/types/test";
import { TestStatus } from "~/types/test";
import { SecurityUsersResponse } from ".";
import { SecurityUserResponse } from "./[id]";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  const session = await getServerSession(req, res, authOptions);
  const validationResult = await validateUserSession(session);
  
  if ('error' in validationResult) {
    res.status(validationResult.status).json({
      success: false,
      tests: [{
        name: "Authentication",
        status: TestStatus.Failed,
        message: "User not authenticated"
      }]
    });
    return;
  }

  const testResults: TestResult[] = [];
  let createdRecordId: string | null = null;

  // Initialize all test results with not executed state
  testResults.push(
    {
      name: "Create Record",
      status: TestStatus.NotExecuted,
      message: "Not executed"
    }, 
    {
      name: "Retrieve All Records",
      status: TestStatus.NotExecuted,
      message: "Not executed"
    }, 
    {
      name: "Retrieve Single Record",
      status: TestStatus.NotExecuted,
      message: "Not executed"
    }, 
    {
      name: "Update Record",
      status: TestStatus.NotExecuted,
      message: "Not executed"
    }, 
    {
      name: "Delete Record",
      status: TestStatus.NotExecuted,
      message: "Not executed"
    }
  );

  try {
    // Test 1: Create a new record
    const createTest = await testCreateSecurityUser(req);
    testResults[0] = createTest;
    if (createTest.status === TestStatus.Failed) {
      throw new Error("Create test failed");
    }
    createdRecordId = (createTest.details as { UserID: string })?.UserID || null;

    // Test 2: Retrieve all records
    const readAllTest = await testReadAllSecurityUsers(req);
    testResults[1] = readAllTest;
    if (readAllTest.status === TestStatus.Failed) {
      throw new Error("Read all test failed");
    }

    // Test 3: Retrieve the new record
    if (createdRecordId) {
      const readSingleTest = await testReadSingleSecurityUser(req, createdRecordId);
      testResults[2] = readSingleTest;
      if (readSingleTest.status === TestStatus.Failed) {
        throw new Error("Read single test failed");
      }
    }

    // Test 4: Update the record
    if (createdRecordId) {
      const updateTest = await testUpdateSecurityUser(req, createdRecordId);
      testResults[3] = updateTest;
      if (updateTest.status === TestStatus.Failed) {
        throw new Error("Update test failed");
      }
    }

    // Test 5: Delete the record
    if (createdRecordId) {
      const deleteTest = await testDeleteSecurityUser(req, createdRecordId);
      testResults[4] = deleteTest;
      if (deleteTest.status === TestStatus.Failed) {
        throw new Error("Delete test failed");
      } else {
        createdRecordId = null;
      }
    }

    res.status(200).json({
      success: testResults.every(t => (t.status === TestStatus.Success || t.status === TestStatus.NotExecuted)),
      tests: testResults
    });
  } catch (error) {
    console.error("Test error:", error);
    res.status(500).json({
      success: false,
      tests: testResults
    });
  } finally {
    // Always attempt cleanup
    if (createdRecordId) {
      try {
        console.debug("Cleaning up test record:", createdRecordId);
        const { success, result } = await makeApiCall<SecurityUserResponse>(req, `/api/protected/security_users/${createdRecordId}`, 'DELETE');
        if (!success || result?.error) {
          console.error("Failed to clean up test record:", result?.error);
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
    }
  }
}

async function testCreateSecurityUser(req: NextApiRequest): Promise<TestResult> {
  try {
    const testRecord = {
      UserName: `testuser${Date.now()}@example.com`,
      DisplayName: `Test User ${Date.now()}`,
      RoleID: 2, // Assuming 2 is a valid role ID
      GroupID: "intern",
      Status: "1",
      Password: "testpassword123"
    };

    const { success, result } = await makeApiCall<SecurityUsersResponse>(req, '/api/protected/security_users', 'POST', testRecord);
    if (!success || !result?.data) {
      return {
        name: "Create Record",
        status: TestStatus.Failed,
        message: `Failed to create record: ${result?.error || 'Unknown error'}`,
        details: result?.error
      };
    }

    const createdRecordId = result.data?.[0]?.UserID;
    if (!createdRecordId) {
      return {
        name: "Create Record",
        status: TestStatus.Failed,
        message: "Failed to get ID from created record",
        details: result.data
      };
    }

    return {
      name: "Create Record",
      status: TestStatus.Success,
      message: "Successfully created test record",
      details: { UserID: createdRecordId }
    };
  } catch (error) {
    return {
      name: "Create Record",
      status: TestStatus.Failed,
      message: "Failed to create test record",
      details: error
    };
  }
}

async function testReadAllSecurityUsers(req: NextApiRequest): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<SecurityUsersResponse>(req, '/api/protected/security_users', "GET");
    if (!success || result?.error) {
      return {
        name: "Retrieve All Records",
        status: TestStatus.Failed,
        message: `Failed to retrieve records: ${result?.error || 'Unknown error'}`,
        details: result?.error
      };
    }

    return {
      name: "Retrieve All Records",
      status: TestStatus.Success,
      message: `Successfully retrieved ${result?.data?.length} records`,
      details: { count: result?.data?.length }
    };
  } catch (error) {
    return {
      name: "Retrieve All Records",
      status: TestStatus.Failed,
      message: "Failed to retrieve records",
      details: error
    };
  }
}

async function testReadSingleSecurityUser(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<SecurityUserResponse>(req, `/api/protected/security_users/${id}`, "GET");
    if (!success || result?.error) {
      return {
        name: "Retrieve Single Record",
        status: TestStatus.Failed,
        message: `Failed to retrieve single record: ${result?.error || 'Unknown error'}`,
        details: { id, error: result?.error }
      };
    }

    return {
      name: "Retrieve Single Record",
      status: TestStatus.Success,
      message: "Successfully retrieved the test record",
      details: result?.data
    };
  } catch (error) {
    return {
      name: "Retrieve Single Record",
      status: TestStatus.Failed,
      message: "Failed to retrieve single record",
      details: error
    };
  }
}

async function testUpdateSecurityUser(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<SecurityUserResponse>(req, `/api/protected/security_users/${id}`);
    if (!success || !result?.data) {
      return {
        name: "Update Record",
        status: TestStatus.Failed,
        message: `Failed to retrieve record for update: ${result?.error || 'Unknown error'}`,
        details: { id, error: result?.error }
      };
    }

    const updatedData = {
      UserID: result.data?.UserID,
      DisplayName: `Updated ${result.data?.DisplayName}`,
      Status: "2"
    };

    const { success: updateSuccess, result: updateResult } = await makeApiCall<SecurityUserResponse>(req, `/api/protected/security_users/${id}`, 'PUT', updatedData);
    if (!updateSuccess || !updateResult?.data) {
      return {
        name: "Update Record",
        status: TestStatus.Failed,
        message: `Failed to update record: ${updateResult?.error || 'Unknown error'}`,
        details: { id, error: updateResult?.error }
      };
    }

    return {
      name: "Update Record",
      status: TestStatus.Success,
      message: "Successfully updated the test record",
      details: updateResult?.data
    };
  } catch (error) {
    return {
      name: "Update Record",
      status: TestStatus.Failed,
      message: "Failed to update record",
      details: error
    };
  }
}

async function testDeleteSecurityUser(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<SecurityUserResponse>(req, `/api/protected/security_users/${id}`, 'DELETE');
    if (!success) {
      return {
        name: "Delete Record",
        status: TestStatus.Failed,
        message: `Failed to delete record: ${result?.error || 'Unknown error'}`,
        details: { id, error: result?.error }
      };
    }

    return {
      name: "Delete Record",
      status: TestStatus.Success,
      message: "Successfully deleted the test record",
      details: { UserID: id }
    };
  } catch (error) {
    return {
      name: "Delete Record",
      status: TestStatus.Failed,
      message: "Failed to delete record",
      details: error
    };
  }
} 
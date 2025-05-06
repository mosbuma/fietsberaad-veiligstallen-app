import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession, makeApiCall } from "~/utils/server/database-tools";
import type { TestResult, TestResponse } from "~/types/test";
import { TestStatus } from "~/types/test";
import { DataprovidersResponse } from ".";
import { DataproviderResponse } from "./[id]";
import { TestError } from "~/types/test";
import bcrypt from "bcrypt";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  const session = await getServerSession(req, res, authOptions);
  const validationResult = await validateUserSession(session, "dataprovider");

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
    const createTest = await testCreateDataprovider(req);
    testResults[0] = createTest;
    if (createTest.status === TestStatus.Failed) {
      throw new TestError("Create test failed", createTest);
    }
    createdRecordId = (createTest.details as { ID: string })?.ID || null;

    // Test 2: Retrieve all records
    const readAllTest = await testReadAllDataproviders(req);
    testResults[1] = readAllTest;
    if (readAllTest.status === TestStatus.Failed) {
      throw new TestError("Read all test failed", readAllTest);
    }

    // Test 3: Retrieve the new record
    if (createdRecordId) {
      const readSingleTest = await testReadSingleDataprovider(req, createdRecordId);
      testResults[2] = readSingleTest;
      if (readSingleTest.status === TestStatus.Failed) {
        throw new TestError("Read single test failed", readSingleTest);
      }
    }

    // Test 4: Update the record
    if (createdRecordId) {
      const updateTest = await testUpdateDataprovider(req, createdRecordId);
      testResults[3] = updateTest;
      if (updateTest.status === TestStatus.Failed) {
        throw new TestError("Update test failed", updateTest);
      }
    }

    // Test 5: Delete the record
    if (createdRecordId) {
      const deleteTest = await testDeleteDataprovider(req, createdRecordId);
      testResults[4] = deleteTest;
      if (deleteTest.status === TestStatus.Failed) {
        throw new TestError("Delete test failed", deleteTest);
      } else {
        createdRecordId = null;
      }
    }

    res.status(200).json({
      success: testResults.every(t => (t.status === TestStatus.Success || t.status === TestStatus.NotExecuted)),
      tests: testResults
    });
  } catch (error) {
    if(error instanceof TestError) {
      console.error(`Test failed: ${error.message} ${JSON.stringify(error.testResult,null,2)}`);
    } else {
      console.error("Unexpected error:", error);
    }
    res.status(500).json({
      success: false,
      tests: testResults
    });
  } finally {
    // Always attempt cleanup
    if (createdRecordId) {
      try {
        const { success, result } = await makeApiCall<DataproviderResponse>(req, `/api/protected/dataprovider/${createdRecordId}`, 'DELETE');
        if (!success || result?.error) {
          console.error("Failed to clean up test record:", result?.error);
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
    }
  }
}

async function testCreateDataprovider(req: NextApiRequest): Promise<TestResult> {
  try {
    const testRecord = {
      CompanyName: `Test Dataprovider ${Date.now()}`,
      ItemType: "dataprovider",
      UrlName: `test-dataprovider-${Date.now()}`,
      Password: await bcrypt.hash("test", 10)
    };

    const { success, result } = await makeApiCall<DataprovidersResponse>(req, '/api/protected/dataprovider', 'POST', testRecord);
    if (!success || !result) {
      return {
        name: "Create Record",
        status: TestStatus.Failed,
        message: `Failed to create record: ${result?.error || 'Unknown error'}`,
        details: result?.error
      };
    }

    const createdRecordId = result.data?.[0]?.ID;
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
      details: { ID: createdRecordId }
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

async function testReadAllDataproviders(req: NextApiRequest): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<DataprovidersResponse>(req, '/api/protected/dataprovider');
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

async function testReadSingleDataprovider(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result }  = await makeApiCall<DataproviderResponse>(req, `/api/protected/dataprovider/${id}`);
    if (!success || result?.error) {
      console.error("testReadSingleDataprovider", result?.error);
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

async function testUpdateDataprovider(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<DataproviderResponse>(req, `/api/protected/dataprovider/${id}`);
    if (!success || !result) {
      return {
        name: "Update Record",
        status: TestStatus.Failed,
        message: `Failed to retrieve record for update: ${result?.error || 'Unknown error'}`,
        details: { id, error: result?.error }
      };
    }

    const updatedData = {
      ID: result.data?.ID,
      CompanyName: `Updated ${result.data?.CompanyName}`,
      UrlName: `updated-${Date.now()}`,
      Password: await bcrypt.hash("updated", 10)
    };

    const { success: updateSuccess, result: updateResult } = await makeApiCall<DataproviderResponse>(req, `/api/protected/dataprovider/${id}`, 'PUT', updatedData);
    if (!updateSuccess || !updateResult) {
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
      details: updateResult.data
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

async function testDeleteDataprovider(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const apiresult = await makeApiCall<DataproviderResponse>(req, `/api/protected/dataprovider/${id}`, 'DELETE');
    if (!apiresult.success) {
      return {
        name: "Delete Record",
        status: TestStatus.Failed,
        message: `Failed to delete record: ${apiresult.result?.error || 'Unknown error'}`,
        details: { id, error: apiresult.result?.error }
      };
    }

    return {
      name: "Delete Record",
      status: TestStatus.Success,
      message: "Successfully deleted the test record",
      details: { ID: id }
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
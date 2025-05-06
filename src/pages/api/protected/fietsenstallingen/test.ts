import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession, makeApiCall } from "~/utils/server/database-tools";
import type { TestResult, TestResponse } from "~/types/test";
import { TestStatus } from "~/types/test";
import { FietsenstallingenResponse } from ".";
import { FietsenstallingResponse } from "./[id]";
import { TestError } from "~/types/test";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  const session = await getServerSession(req, res, authOptions);
  const validationResult = await validateUserSession(session, "any");
  
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
    const createTest = await testCreateFietsenstalling(req);
    console.log("createTest", createTest);
    testResults[0] = createTest;
    if (createTest.status === TestStatus.Failed) {
      throw new TestError("Create test failed", createTest);
    }
    createdRecordId = (createTest.details as { ID: string })?.ID || null;
    console.log("createdRecordId", createdRecordId);
    // Test 2: Retrieve all records
    const readAllTest = await testReadAllFietsenstallingen(req);
    testResults[1] = readAllTest;
    if (readAllTest.status === TestStatus.Failed) {
      throw new TestError("Read all test failed", readAllTest);
    }

    // Test 3: Retrieve the new record
    if (createdRecordId) {
      const readSingleTest = await testReadSingleFietsenstalling(req, createdRecordId);
      testResults[2] = readSingleTest;
      if (readSingleTest.status === TestStatus.Failed) {
        throw new TestError("Read single test failed", readSingleTest);
      }
    }

    // Test 4: Update the record
    if (createdRecordId) {
      const updateTest = await testUpdateFietsenstalling(req, createdRecordId);
      testResults[3] = updateTest;
      if (updateTest.status === TestStatus.Failed) {
        throw new TestError("Update test failed", updateTest);
      }
    }

    // // Test 5: Delete the record
    if (createdRecordId) {
      const deleteTest = await testDeleteFietsenstalling(req, createdRecordId);
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
        const { success, result } = await makeApiCall<FietsenstallingResponse>(req, `/api/protected/fietsenstallingen/${createdRecordId}`, 'DELETE');
        if (!success || result?.error) {
          console.error("Failed to clean up test record:", result?.error);
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
    }
  }
}

export const testRecordCreateFietsenstalling = {
  StallingsID: `TEST${Date.now()}`,
  Title: `Test Fietsenstalling ${Date.now()}`,
  Location: "Test Location",
  Plaats: "Test City",
  Capacity: 100,
  Status: "1",
  Type: "bewaakt",
  Verwijssysteem: false,
  FMS: false,
  IsStationsstalling: false,
  IsPopup: false,
  BerekentStallingskosten: false,
  AantalReserveerbareKluizen: 0,
  MaxStallingsduur: 0,
  HeeftExterneBezettingsdata: false,
  hasUniSectionPrices: true,
  hasUniBikeTypePrices: false,
  BronBezettingsdata: "FMS"
};

async function testCreateFietsenstalling(req: NextApiRequest): Promise<TestResult> {
  try {
    const { success, result }  = await makeApiCall<FietsenstallingenResponse>(req, '/api/protected/fietsenstallingen', 'POST', testRecordCreateFietsenstalling);
    if (!success || !result?.data) {
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

async function testReadAllFietsenstallingen(req: NextApiRequest): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<FietsenstallingenResponse>(req, '/api/protected/fietsenstallingen');
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

async function testReadSingleFietsenstalling(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result }  = await makeApiCall<FietsenstallingResponse>(req, `/api/protected/fietsenstallingen/${id}`);
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

async function testUpdateFietsenstalling(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<FietsenstallingResponse>(req, `/api/protected/fietsenstallingen/${id}`);
    if (!success || !result?.data) {
      return {
        name: "Update Record",
        status: TestStatus.Failed,
        message: `Failed to retrieve record for update: ${result?.error || 'Unknown error'}`,
        details: { id, error: result?.error }
      };
    }

    const updatedData = {
      ID: result.data?.ID,
      Title: `Updated ${result.data?.Title}`,
      Location: "Updated Location"
    };

    const { success: updateSuccess, result: updateResult } = await makeApiCall<FietsenstallingResponse>(req, `/api/protected/fietsenstallingen/${id}`, 'PUT', updatedData);
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

async function testDeleteFietsenstalling(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<FietsenstallingResponse>(req, `/api/protected/fietsenstallingen/${id}`, 'DELETE');
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
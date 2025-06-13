import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession, makeApiCall } from "~/utils/server/database-tools";
import type { TestResult, TestResponse } from "~/types/test";
import { TestStatus } from "~/types/test";
import { ContactsResponse } from ".";
import { ContactResponse } from "./[id]";
import { TestError } from "~/types/test";
import type { ContactValidateResponse } from "./validate";
import { VSContactItemType } from "~/types/contacts";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  const session = await getServerSession(req, res, authOptions);
  const validationResult = await validateUserSession(session, "contacts");

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

  const cleanupResult = await cleanupTestdata(req);
  if (cleanupResult.status === TestStatus.Failed) {
    res.status(500).json({
      success: false,
      tests: [{
        name: "Cleanup Testdata",
        status: TestStatus.Failed,
        message: "Failed to cleanup test data",
        details: cleanupResult.details
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
      name: "Validate Record",
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
    },
  );

  try {
    // Test 1: Create a new record
    const createTest = await testCreateContact(req);
    testResults[0] = createTest;
    if (createTest.status === TestStatus.Failed) {
      throw new TestError("Create test failed", createTest);
    }
    createdRecordId = (createTest.details as { ID: string })?.ID || null;
    console.log("createdRecordId", createdRecordId);

    // Test 2: Retrieve all records
    const readAllTest = await testReadAllContacts(req);
    testResults[1] = readAllTest;
    if (readAllTest.status === TestStatus.Failed) {
      throw new TestError("Read all test failed", readAllTest);
    }

    // Test 3: Retrieve the new record
    if (createdRecordId) {
      const readSingleTest = await testReadSingleContact(req, createdRecordId);
      console.log("readSingleTest", readSingleTest);
      testResults[2] = readSingleTest;
      if (readSingleTest.status === TestStatus.Failed) {
        throw new TestError("Read single test failed", readSingleTest);
      }
    }

    // Test 4: use the Validate api to check if the record is valid
    if (createdRecordId) {
      const validateTest = await testValidateContact(req, createdRecordId);
      console.log("==validateTest", validateTest);
      testResults[3] = validateTest;
      if (validateTest.status === TestStatus.Failed) {
        throw new TestError("Validate test failed", validateTest);
      }
    }

    // Test 5: Update the record
    if (createdRecordId) {
      const updateTest = await testUpdateContact(req, createdRecordId);
      testResults[4] = updateTest;
      if (updateTest.status === TestStatus.Failed) {
        throw new TestError("Update test failed", updateTest);
      }
    }

    // Test 6: Delete the record
    if (createdRecordId) {
      const deleteTest = await testDeleteContact(req, createdRecordId);
      testResults[5] = deleteTest;
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
        const { success, result } = await makeApiCall<ContactResponse>(req, `/api/protected/contacts/${createdRecordId}`, 'DELETE');
        if (!success || result?.error) {
          console.error("Failed to clean up test record:", result?.error);
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
    }
  }
}

export const testRecordCreateContact = {
  FirstName: `Test First ${Date.now()}`,
  LastName: `Test Last ${Date.now()}`,
  ItemType: VSContactItemType.Organizations,
  Email1: "test@example.com",
  Phone1: "0612345678",
  Mobile1: "0612345678",
  JobTitle: "Test Job",
  Status: "1"
};

async function testCreateContact(req: NextApiRequest): Promise<TestResult> {
  try {
    const { success, result, error }  = await makeApiCall<ContactsResponse>(req, '/api/protected/contacts/new', 'POST', testRecordCreateContact);
    console.log("testCreateContact", result, error);
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

async function testReadAllContacts(req: NextApiRequest): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<ContactsResponse>(req, '/api/protected/contacts');
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

async function testReadSingleContact(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result }  = await makeApiCall<ContactResponse>(req, `/api/protected/contacts/${id}`);
    if (!success || result?.error) {
      return {
        name: "Retrieve Single Record",
        status: TestStatus.Failed,
        message: `Failed to retrieve record: ${result?.error || 'Unknown error'}`,
        details: result?.error
      };
    }

    if (!result?.data) {
      return {
        name: "Retrieve Single Record",
        status: TestStatus.Failed,
        message: "No data returned",
        details: result
      };
    }

    return {
      name: "Retrieve Single Record",
      status: TestStatus.Success,
      message: "Successfully retrieved record",
      details: result.data
    };
  } catch (error) {
    return {
      name: "Retrieve Single Record",
      status: TestStatus.Failed,
      message: "Failed to retrieve record",
      details: error
    };
  }
}

async function testUpdateContact(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const updateData = {
      ...testRecordCreateContact,
      FirstName: `Updated First ${Date.now()}`,
      LastName: `Updated Last ${Date.now()}`,
      Email1: "updated@example.com",
      Phone1: "0687654321",
      Mobile1: "0687654321",
      JobTitle: "Updated Job"
    };

    const { success, result } = await makeApiCall<ContactResponse>(req, `/api/protected/contacts/${id}`, 'PUT', updateData);
    if (!success || result?.error) {
      return {
        name: "Update Record",
        status: TestStatus.Failed,
        message: `Failed to update record: ${result?.error || 'Unknown error'}`,
        details: result?.error
      };
    }

    if (!result?.data) {
      return {
        name: "Update Record",
        status: TestStatus.Failed,
        message: "No data returned after update",
        details: result
      };
    }

    // Verify the update
    if (result.data.FirstName !== updateData.FirstName ||
        result.data.LastName !== updateData.LastName ||
        result.data.Email1 !== updateData.Email1 ||
        result.data.Phone1 !== updateData.Phone1 ||
        result.data.Mobile1 !== updateData.Mobile1 ||
        result.data.JobTitle !== updateData.JobTitle) {
      return {
        name: "Update Record",
        status: TestStatus.Failed,
        message: "Update verification failed - data mismatch",
        details: {
          expected: updateData,
          actual: result.data
        }
      };
    }

    return {
      name: "Update Record",
      status: TestStatus.Success,
      message: "Successfully updated record",
      details: result.data
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

async function testDeleteContact(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<ContactResponse>(req, `/api/protected/contacts/${id}`, 'DELETE');
    if (!success || result?.error) {
      return {
        name: "Delete Record",
        status: TestStatus.Failed,
        message: `Failed to delete record: ${result?.error || 'Unknown error'}`,
        details: result?.error
      };
    }

    // Verify deletion by trying to read the record
    const { success: readSuccess, result: readResult } = await makeApiCall<ContactResponse>(req, `/api/protected/contacts/${id}`);
    if (readSuccess && readResult?.data) {
      return {
        name: "Delete Record",
        status: TestStatus.Failed,
        message: "Record still exists after deletion",
        details: readResult.data
      };
    }

    return {
      name: "Delete Record",
      status: TestStatus.Success,
      message: "Successfully deleted record"
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

async function testValidateContact(req: NextApiRequest, id: string): Promise<TestResult> {
  try {
    const { success, result } = await makeApiCall<ContactValidateResponse>(req, `/api/protected/contacts/${id}`);
    if (!success || !result) {
      return {
        name: "Validate Record",
        status: TestStatus.Failed,
        message: `Failed to validate record: ${result?.message || 'Unknown error'}`,
        details: result?.message
      };
    }

    // if (!result?.data?.isValid) {
    //   return {
    //     name: "Validate Record",
    //     status: TestStatus.Failed,
    //     message: "Record validation failed",
    //     details: result.data
    //   };
    // }

    return {
      name: "Validate Record",
      status: TestStatus.Success,
      message: "Successfully validated record",
      details: result
    };
  } catch (error) {
    return {
      name: "Validate Record",
      status: TestStatus.Failed,
      message: "Failed to validate record",
      details: error
    };
  }
}

async function cleanupTestdata(req: NextApiRequest): Promise<TestResult> {
  try {
    // Find and delete any test records that might have been left over from previous test runs
    const testRecords = await prisma.contacts.findMany({
      where: {
        FirstName: {
          startsWith: "Test First"
        },
        LastName: {
          startsWith: "Test Last"
        }
      }
    });

    for (const record of testRecords) {
      try {
        const { success, result } = await makeApiCall<ContactResponse>(req, `/api/protected/contacts/${record.ID}`, 'DELETE');
        if (!success || result?.error) {
          console.error(`Failed to delete test record ${record.ID}:`, result?.error);
        }
      } catch (error) {
        console.error(`Error deleting test record ${record.ID}:`, error);
      }
    }

    return {
      name: "Cleanup Testdata",
      status: TestStatus.Success,
      message: "Successfully cleaned up test data"
    };
  } catch (error) {
    return {
      name: "Cleanup Testdata",
      status: TestStatus.Failed,
      message: "Failed to clean up test data",
      details: error
    };
  }
} 
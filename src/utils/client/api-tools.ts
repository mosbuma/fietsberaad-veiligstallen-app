type ApiSuccess<T> = {
    success: true;
    result: T;
};

type ApiError = {
    success: false;
    error: string;
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Helper function to make client-side API calls
export async function makeClientApiCall<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
): Promise<ApiResponse<T>> {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        const response = await fetch(endpoint, {
            method,
            headers,
            credentials: 'include', // Include cookies for authentication
            ...(body && { body: JSON.stringify(body) })
        });

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP error! status: ${response.status}`
            };
        }

        const data = await response.json();
        return {
            success: true,
            result: data
        };
    } catch (error) {
        console.error('API call error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
} 
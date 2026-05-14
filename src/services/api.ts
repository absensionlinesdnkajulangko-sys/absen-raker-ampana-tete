
export interface AttendanceData {
  namaLengkap: string;
  nip?: string;
  jabatan: string;
  namaInstansi: string;
  signature: string; // Base64 signature
  sheetName?: string;
}

/**
 * Service to handle communication with Google Apps Script (GAS)
 */
export const submitAttendance = async (url: string, data: AttendanceData) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // GAS web apps usually require no-cors or standard CORS handling with redirects
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Note: with mode: 'no-cors', we won't get the response body, but we can assume success if no error is thrown
    return { success: true };
  } catch (error) {
    console.error('Submission error:', error);
    throw error;
  }
};

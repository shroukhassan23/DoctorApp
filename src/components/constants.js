// Get current URLs - synchronous version that works immediately
const getUrlsSync = () => {
  // Check if we're in Electron environment and have access to config
  if (typeof window !== 'undefined' && window.electron) {
    try {
      const config = window.electron.getConfigSync ? window.electron.getConfigSync() : null;

      if (config) {
        const host = config.installationType === 'client'
          ? config.masterHost
          : 'localhost';

        // FIXED: Single port for combined service
        const port = config.installationType === 'client'
          ? config.servicePort || 3001
          : 3001;

        return {
          base: `http://${host}:${port}`
        };
      }
    } catch (error) {
      // Fallback to localhost
    }
  }

  // Default fallback
  return {
    base: 'http://localhost:3001'
  };
};

const urls = getUrlsSync();

// Patient Management APIs
export const patientUrl = `${urls.base}/Patients`;
export const editPatientUrl = (patientId) => `${urls.base}/Patients/${patientId}`;
export const searchPatientUrl =`${urls.base}/search/Patients/search`;

// Visit Management APIs 
export const visitBaseUrl=`${urls.base}/Visits`; 
export const visitTypesPatientUrl = `${urls.base}/Visittypes`;
export const visitStatusPatientUrl = `${urls.base}/Visitstatus`;
export const visitMedicinePatientUrl = `${urls.base}/Visit/medicine`;
export const visitLabTestsPatientUrl = `${urls.base}/Visit/labtests`;
export const visitImagingStudiesPatientUrl = `${urls.base}/Visit/imagingstudies`;
export const addVisitUrl = `${urls.base}/Visit/add`;
export const createVisitUrl = `${urls.base}/Visit/add`;
export const getVisitUrl = (visitId) => `${urls.base}/visits/${visitId}`;
export const updateVisitUrl = (visitId) => `${urls.base}/visits/${visitId}`;
export const deleteVisitUrl = (visitId) => `${urls.base}/visits/${visitId}`;
export const updateVisitStatusUrl = (visitId) => `${urls.base}/visits/${visitId}/status`;

// Prescription Management APIs
export const addprescriptionUrl = `${urls.base}/prescription/add`;
export const createPrescriptionUrl = `${urls.base}/prescription/add`;
export const addPrescriptionMedicinesUrl = `${urls.base}/prescription/medicines/add`;
export const addPrescriptionLabTestsUrl = `${urls.base}/prescription/labtests/add`;
export const addPrescriptionImagingStudiesUrl = `${urls.base}/prescription/imagingstudies/add`;
export const updatePrescriptionMedicinesUrl = `${urls.base}/prescription/medicines/add`;
export const updatePrescriptionLabTestsUrl = `${urls.base}/prescription/labtests/add`;
export const updatePrescriptionImagingStudiesUrl = `${urls.base}/prescription/imagingstudies/add`;
export const getPrescriptionUrl = (prescriptionId) => `${urls.base}/prescriptions/${prescriptionId}`;
export const getVisitPrescriptionUrl = (visitId) => `${urls.base}/visits/${visitId}/prescription`;
export const updatePrescriptionUrl = (prescriptionId) => `${urls.base}/prescriptions/${prescriptionId}`;
export const deletePrescriptionItemsUrl = (prescriptionId) => `${urls.base}/prescriptions/${prescriptionId}/items`;
export const deletePrescriptionLabTestsUrl = (prescriptionId) => `${urls.base}/prescriptions/${prescriptionId}/labtests`;
export const deletePrescriptionImagingStudiesUrl = (prescriptionId) => `${urls.base}/prescriptions/${prescriptionId}/imagingstudies`;

// Patient Data APIs
export const getPatientVisitsUrl = (patientId) => `${urls.base}/patients/${patientId}/visits`;
export const getPatientByIdUrl = (patientId) => `${urls.base}/patients/${patientId}`;

// File Management APIs
export const getPatientFilesUrl = (patientId) => `${urls.base}/patients/${patientId}/files`;
export const uploadPatientFileUrl = (patientId) => `${urls.base}/patients/${patientId}/files`;
export const uploadFileUrl = (patientId) => `${urls.base}/patients/${patientId}/files`;
export const downloadPatientFileUrl = (patientId, fileId) => `${urls.base}/patients/${patientId}/files/${fileId}/download`;
export const deletePatientFileUrl = (patientId, fileId) => `${urls.base}/patients/${patientId}/files/${fileId}`;
export const getFileUrl = (patientId, fileId) => `${urls.base}/patients/${patientId}/files/${fileId}`;
export const previewPatientFileUrl = (patientId, fileId) => `${urls.base}/patients/${patientId}/files/${fileId}/preview`;

// Doctor Profile APIs
export const doctorProfileUrl = `${urls.base}/doctor-profile`;
export const updateDoctorProfileUrl = (id) => `${urls.base}/doctor-profile/${id}`;
export const createDoctorProfileUrl = `${urls.base}/doctor-profile`;

// History APIs
export const dosageHistoryUrl = `${urls.base}/history/dosage`;
export const durationHistoryUrl = `${urls.base}/history/duration`;
export const diagnosisHistoryUrl = `${urls.base}/history/diagnosis`;
export const notesHistoryUrl = `${urls.base}/history/notes`;
export const instructionHistoryUrl = `${urls.base}/history/instruction`;

// Management APIs - Medicines
export const managementMedicinesUrl = `${urls.base}/management/medicines`;
export const managementMedicineUrl = (id) => `${urls.base}/management/medicines/${id}`;
export const addMedicineUrl = `${urls.base}/management/medicines`;
export const updateMedicineUrl = (id) => `${urls.base}/management/medicines/${id}`;
export const deleteMedicineUrl = (id) => `${urls.base}/management/medicines/${id}`;

// Management APIs - Lab Tests
export const managementLabTestsUrl = `${urls.base}/management/labtests`;
export const managementLabTestUrl = (id) => `${urls.base}/management/labtests/${id}`;
export const addLabTestUrl = `${urls.base}/management/labtests`;
export const updateLabTestUrl = (id) => `${urls.base}/management/labtests/${id}`;
export const deleteLabTestUrl = (id) => `${urls.base}/management/labtests/${id}`;

// Management APIs - Imaging Studies
export const managementImagingStudiesUrl = `${urls.base}/management/imagingstudies`;
export const managementImagingStudyUrl = (id) => `${urls.base}/management/imagingstudies/${id}`;
export const addImagingStudyUrl = `${urls.base}/management/imagingstudies`;
export const updateImagingStudyUrl = (id) => `${urls.base}/management/imagingstudies/${id}`;
export const deleteImagingStudyUrl = (id) => `${urls.base}/management/imagingstudies/${id}`;

// Reports APIs
export const reportsDebugUrl = `${urls.base}/reports/debug`;
export const reportsTestUrl = `${urls.base}/reports/test`;
export const reportsVisitsUrl = `${urls.base}/reports/visits`;
export const reportsDebugDatabaseUrl = `${urls.base}/reports/debug-database`;
export const reportsVisitStatsUrl = `${urls.base}/reports/visit-stats`;
export const reportsTodayUrl = `${urls.base}/reports/today`;
export const reportsVisitsAllUrl = `${urls.base}/reports/visits/all`;

// Helper function to refresh URLs when configuration changes
export const refreshUrls = () => {
  const newUrls = getUrlsSync();
  Object.assign(urls, newUrls);
  return newUrls;
};

// Export the current URLs object for debugging
export const getCurrentUrls = () => urls;
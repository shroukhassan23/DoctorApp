// Dynamic configuration based on installation type
const getBaseUrls = () => {
    // Check if we're in Electron environment and have access to config
    if (typeof window !== 'undefined' && window.electron && window.electron.getConfig) {
      try {
        const config = window.electron.getConfig();
        const host = config.database?.host || 'localhost';
        const mysqlPort = parseInt(config.database?.port || '3306');
        
        // Backend services run on MySQL port + 1, +2, +3
        return {
          patient: `http://${host}:${mysqlPort + 1}`,    // Default: 3001
          visit: `http://${host}:${mysqlPort + 2}`,      // Default: 3002  
          reports: `http://${host}:${mysqlPort + 3}`     // Default: 3003
        };
      } catch (error) {
        console.warn('Failed to get config, using default URLs:', error);
      }
    }
    
    // Fallback to localhost (development or when config not available)
    return {
      patient: 'http://localhost:3001',
      visit: 'http://localhost:3002', 
      reports: 'http://localhost:3003'
    };
  };
  
  // Get current URLs
  const urls = getBaseUrls();
  
  // Patient Management APIs
  export const patientUrl = `${urls.patient}/Patients`;
  export const editPatientUrl = (patientId) => `${urls.patient}/Patients/${patientId}`;
  
  // Visit Management APIs
  export const visitTypesPatientUrl = `${urls.visit}/Visittypes`;
  export const visitStatusPatientUrl = `${urls.visit}/Visitstatus`;
  export const visitMedicinePatientUrl = `${urls.visit}/Visit/medicine`;
  export const visitLabTestsPatientUrl = `${urls.visit}/Visit/labtests`;
  export const visitImagingStudiesPatientUrl = `${urls.visit}/Visit/imagingstudies`;
  export const addVisitUrl = `${urls.visit}/Visit/add`;
  export const createVisitUrl = `${urls.visit}/Visit/add`;
  export const getVisitUrl = (visitId) => `${urls.visit}/visits/${visitId}`;
  export const updateVisitUrl = (visitId) => `${urls.visit}/visits/${visitId}`;
  export const deleteVisitUrl = (visitId) => `${urls.visit}/visits/${visitId}`;
  export const updateVisitStatusUrl = (visitId) => `${urls.visit}/visits/${visitId}/status`;
  
  // Prescription Management APIs
  export const addprescriptionUrl = `${urls.visit}/prescription/add`;
  export const createPrescriptionUrl = `${urls.visit}/prescription/add`;
  export const addPrescriptionMedicinesUrl = `${urls.visit}/prescription/medicines/add`;
  export const addPrescriptionLabTestsUrl = `${urls.visit}/prescription/labtests/add`;
  export const addPrescriptionImagingStudiesUrl = `${urls.visit}/prescription/imagingstudies/add`;
  export const updatePrescriptionMedicinesUrl = `${urls.visit}/prescription/medicines/add`;
  export const updatePrescriptionLabTestsUrl = `${urls.visit}/prescription/labtests/add`;
  export const updatePrescriptionImagingStudiesUrl = `${urls.visit}/prescription/imagingstudies/add`;
  export const getPrescriptionUrl = (prescriptionId) => `${urls.visit}/prescriptions/${prescriptionId}`;
  export const getVisitPrescriptionUrl = (visitId) => `${urls.visit}/visits/${visitId}/prescription`;
  export const updatePrescriptionUrl = (prescriptionId) => `${urls.visit}/prescriptions/${prescriptionId}`;
  export const deletePrescriptionItemsUrl = (prescriptionId) => `${urls.visit}/prescriptions/${prescriptionId}/items`;
  export const deletePrescriptionLabTestsUrl = (prescriptionId) => `${urls.visit}/prescriptions/${prescriptionId}/labtests`;
  export const deletePrescriptionImagingStudiesUrl = (prescriptionId) => `${urls.visit}/prescriptions/${prescriptionId}/imagingstudies`;
  export const deletePrescriptionImagingUrl = (prescriptionId) => `${urls.visit}/prescriptions/${prescriptionId}/imagingstudies`;
  
  // Patient Data APIs
  export const getPatientVisitsUrl = (patientId) => `${urls.visit}/patients/${patientId}/visits`;
  export const getPatientByIdUrl = (patientId) => `${urls.visit}/patients/${patientId}`;
  
  // File Management APIs
  export const getPatientFilesUrl = (patientId) => `${urls.visit}/patients/${patientId}/files`;
  export const uploadPatientFileUrl = (patientId) => `${urls.visit}/patients/${patientId}/files`;
  export const uploadFileUrl = (patientId) => `${urls.visit}/patients/${patientId}/files`;
  export const downloadPatientFileUrl = (patientId, fileId) => `${urls.visit}/patients/${patientId}/files/${fileId}/download`;
  export const deletePatientFileUrl = (patientId, fileId) => `${urls.visit}/patients/${patientId}/files/${fileId}`;
  export const getFileUrl = (patientId, fileId) => `${urls.visit}/patients/${patientId}/files/${fileId}`;
  export const previewPatientFileUrl = (patientId, fileId) => `${urls.visit}/patients/${patientId}/files/${fileId}/preview`;
  export const getVisitFilesUrl = (visitId) => `${urls.visit}/visits/${visitId}/files`;
  
  // Doctor Profile APIs
  export const doctorProfileUrl = `${urls.visit}/doctor-profile`;
  export const updateDoctorProfileUrl = (id) => `${urls.visit}/doctor-profile/${id}`;
  export const createDoctorProfileUrl = `${urls.visit}/doctor-profile`;
  
  // History APIs
  export const historyBaseUrl = `${urls.visit}/history`;
  export const getInstructionHistoryUrl = `${urls.visit}/instruction-history`;
  export const getDosageHistoryUrl = `${urls.visit}/dosage-history`;
  export const getDurationHistoryUrl = `${urls.visit}/duration-history`;
  export const getDiagnosisHistoryUrl = `${urls.visit}/diagnosis-history`;
  export const getNotesHistoryUrl = `${urls.visit}/notes-history`;
  export const dosageHistoryUrl = `${historyBaseUrl}/dosage`;
  export const durationHistoryUrl = `${historyBaseUrl}/duration`;
  export const diagnosisHistoryUrl = `${historyBaseUrl}/diagnosis`;
  export const notesHistoryUrl = `${historyBaseUrl}/notes`;
  export const instructionHistoryUrl = `${historyBaseUrl}/instruction`;
  
  // Management APIs - Medicines
  export const managementMedicinesUrl = `${urls.visit}/management/medicines`;
  export const managementMedicineUrl = (id) => `${urls.visit}/management/medicines/${id}`;
  export const medicinesUrl = `${urls.visit}/management/medicines`;
  export const addMedicineUrl = `${urls.visit}/management/medicines`;
  export const updateMedicineUrl = (id) => `${urls.visit}/management/medicines/${id}`;
  export const deleteMedicineUrl = (id) => `${urls.visit}/management/medicines/${id}`;
  
  // Management APIs - Lab Tests
  export const managementLabTestsUrl = `${urls.visit}/management/labtests`;
  export const managementLabTestUrl = (id) => `${urls.visit}/management/labtests/${id}`;
  export const labTestsUrl = `${urls.visit}/management/labtests`;
  export const addLabTestUrl = `${urls.visit}/management/labtests`;
  export const updateLabTestUrl = (id) => `${urls.visit}/management/labtests/${id}`;
  export const deleteLabTestUrl = (id) => `${urls.visit}/management/labtests/${id}`;
  
  // Management APIs - Imaging Studies
  export const managementImagingStudiesUrl = `${urls.visit}/management/imagingstudies`;
  export const managementImagingStudyUrl = (id) => `${urls.visit}/management/imagingstudies/${id}`;
  export const imagingStudiesUrl = `${urls.visit}/management/imagingstudies`;
  export const addImagingStudyUrl = `${urls.visit}/management/imagingstudies`;
  export const updateImagingStudyUrl = (id) => `${urls.visit}/management/imagingstudies/${id}`;
  export const deleteImagingStudyUrl = (id) => `${urls.visit}/management/imagingstudies/${id}`;
  
  // Helper function to refresh URLs when configuration changes
  export const refreshUrls = () => {
    const newUrls = getBaseUrls();
    // This function can be called when the configuration changes
    // to update all URL references dynamically
    return newUrls;
  };
  
  // Export the current URLs object for debugging
  export const getCurrentUrls = () => urls;
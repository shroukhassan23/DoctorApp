export const patientUrl = 'http://localhost:3001/Patients';
export const editPatientUrl = (patientId) => `http://localhost:3001/Patients/${patientId}`;
export const visitTypesPatientUrl = 'http://localhost:3002/Visittypes';
export const visitStatusPatientUrl = 'http://localhost:3002/Visitstatus';
export const visitMedicinePatientUrl = 'http://localhost:3002/Visit/medicine';
export const visitLabTestsPatientUrl = 'http://localhost:3002/Visit/labtests';
export const visitImagingStudiesPatientUrl = 'http://localhost:3002/Visit/imagingstudies';
export const addVisitUrl = 'http://localhost:3002/Visit/add';
export const addprescriptionUrl = 'http://localhost:3002/prescription/add';
export const addPrescriptionMedicinesUrl = 'http://localhost:3002/prescription/medicines/add';
export const addPrescriptionLabTestsUrl = 'http://localhost:3002/prescription/labtests/add';
export const addPrescriptionImagingStudiesUrl = 'http://localhost:3002/prescription/imagingstudies/add';

// Existing endpoints
export const getPatientVisitsUrl = (patientId) => `http://localhost:3002/patients/${patientId}/visits`;
export const getPatientFilesUrl = (patientId) => `http://localhost:3002/patients/${patientId}/files`;
export const uploadPatientFileUrl = (patientId) => `http://localhost:3002/patients/${patientId}/files`;
export const downloadPatientFileUrl = (patientId, fileId) => `http://localhost:3002/patients/${patientId}/files/${fileId}/download`;
export const deletePatientFileUrl = (patientId, fileId) => `http://localhost:3002/patients/${patientId}/files/${fileId}`;
export const doctorProfileUrl = 'http://localhost:3002/doctor-profile';
export const getPatientByIdUrl = (patientId) => `http://localhost:3002/patients/${patientId}`;
export const getPrescriptionUrl = (prescriptionId) => `http://localhost:3002/prescriptions/${prescriptionId}`;
export const getVisitPrescriptionUrl = (visitId) => `http://localhost:3002/visits/${visitId}/prescription`;

// New endpoints for MySQL conversion
export const getVisitFilesUrl = (visitId) => `http://localhost:3002/visits/${visitId}/files`;
export const updateVisitUrl = (visitId) => `http://localhost:3002/visits/${visitId}`;
export const deleteVisitUrl = (visitId) => `http://localhost:3002/visits/${visitId}`;
export const updatePrescriptionUrl = (prescriptionId) => `http://localhost:3002/prescriptions/${prescriptionId}`;
export const deletePrescriptionItemsUrl = (prescriptionId) => `http://localhost:3002/prescriptions/${prescriptionId}/items`;
export const deletePrescriptionLabTestsUrl = (prescriptionId) => `http://localhost:3002/prescriptions/${prescriptionId}/labtests`;
export const deletePrescriptionImagingStudiesUrl = (prescriptionId) => `http://localhost:3002/prescriptions/${prescriptionId}/imagingstudies`;

// Alternative naming for compatibility
export const deletePrescriptionImagingUrl = (prescriptionId) => `http://localhost:3002/prescriptions/${prescriptionId}/imagingstudies`;

// History endpoints
export const getInstructionHistoryUrl = 'http://localhost:3002/instruction-history';
export const getDosageHistoryUrl = 'http://localhost:3002/dosage-history';
export const getDurationHistoryUrl = 'http://localhost:3002/duration-history';
export const getDiagnosisHistoryUrl = 'http://localhost:3002/diagnosis-history';
export const getNotesHistoryUrl = 'http://localhost:3002/notes-history';

// Management endpoints
export const managementLabTestsUrl = 'http://localhost:3002/management/labtests';
export const managementLabTestUrl = (id) => `http://localhost:3002/management/labtests/${id}`;
export const managementImagingStudiesUrl = 'http://localhost:3002/management/imagingstudies';
export const managementImagingStudyUrl = (id) => `http://localhost:3002/management/imagingstudies/${id}`;
export const managementMedicinesUrl = 'http://localhost:3002/management/medicines';
export const managementMedicineUrl = (id) => `http://localhost:3002/management/medicines/${id}`;

// Medicine management endpoints (alternative naming for compatibility)
export const medicinesUrl = 'http://localhost:3002/management/medicines';
export const addMedicineUrl = 'http://localhost:3002/management/medicines';
export const updateMedicineUrl = (id) => `http://localhost:3002/management/medicines/${id}`;
export const deleteMedicineUrl = (id) => `http://localhost:3002/management/medicines/${id}`;

// Lab test management endpoints (alternative naming)
export const labTestsUrl = 'http://localhost:3002/management/labtests';
export const addLabTestUrl = 'http://localhost:3002/management/labtests';
export const updateLabTestUrl = (id) => `http://localhost:3002/management/labtests/${id}`;
export const deleteLabTestUrl = (id) => `http://localhost:3002/management/labtests/${id}`;

// Imaging studies management endpoints (alternative naming)
export const imagingStudiesUrl = 'http://localhost:3002/management/imagingstudies';
export const addImagingStudyUrl = 'http://localhost:3002/management/imagingstudies';
export const updateImagingStudyUrl = (id) => `http://localhost:3002/management/imagingstudies/${id}`;
export const deleteImagingStudyUrl = (id) => `http://localhost:3002/management/imagingstudies/${id}`;

// Additional common endpoints that might be needed
export const updateDoctorProfileUrl = (id) => `http://localhost:3002/doctor-profile/${id}`;
export const createDoctorProfileUrl = 'http://localhost:3002/doctor-profile';

// File operations
export const uploadFileUrl = (patientId) => `http://localhost:3002/patients/${patientId}/files`;
export const getFileUrl = (patientId, fileId) => `http://localhost:3002/patients/${patientId}/files/${fileId}`;

// Visit operations
export const createVisitUrl = 'http://localhost:3002/Visit/add';
export const getVisitUrl = (visitId) => `http://localhost:3002/visits/${visitId}`;

// Prescription operations
export const createPrescriptionUrl = 'http://localhost:3002/prescription/add';
export const updatePrescriptionMedicinesUrl = 'http://localhost:3002/prescription/medicines/add';
export const updatePrescriptionLabTestsUrl = 'http://localhost:3002/prescription/labtests/add';
export const updatePrescriptionImagingStudiesUrl = 'http://localhost:3002/prescription/imagingstudies/add';

export const previewPatientFileUrl = (patientId, fileId) => `http://localhost:3002/patients/${patientId}/files/${fileId}/preview`;


export const historyBaseUrl = 'http://localhost:3002/history';
export const dosageHistoryUrl = `${historyBaseUrl}/dosage`;
export const durationHistoryUrl = `${historyBaseUrl}/duration`;
export const diagnosisHistoryUrl = `${historyBaseUrl}/diagnosis`;
export const notesHistoryUrl = `${historyBaseUrl}/notes`;
export const instructionHistoryUrl = `${historyBaseUrl}/instruction`;

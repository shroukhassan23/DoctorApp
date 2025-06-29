
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { PatientsPage } from '@/components/patients/PatientsPage';
import { MedicinesPage } from '@/components/medicines/MedicinesPage';
import { LabTestsPage } from '@/components/lab-tests/LabTestsPage';
import { ImagingStudiesPage } from '@/components/imaging-studies/ImagingStudiesPage';
import { PrescriptionsPage } from '@/components/prescriptions/PrescriptionsPage';
import { DoctorProfilePage } from '@/components/doctor/DoctorProfilePage';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { DailyReportsPage } from '@/components/reports/DailyReports';
import LicenseTest from '@/components/License/LicenseTest';


export const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<PatientsPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/medicines" element={<MedicinesPage />} />
          <Route path="/lab-tests" element={<LabTestsPage />} />
          <Route path="/imaging-studies" element={<ImagingStudiesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/todayReports" element={<DailyReportsPage />} />
          <Route path="/profile" element={<DoctorProfilePage />} />
          <Route path="/license-test" element={<LicenseTest />} />
        </Routes>
      </div>
    </div>
  );
};

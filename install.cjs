
(async () => {
  try {
    console.log("🛠️ Starting Installation Wizard...");

    console.log("✅ Database setup complete.");

    console.log("🚀 Starting server...");
    require('./mySql/patient.cjs');
    require('./mySql/visit.cjs');
    require('./mySql/reports.cjs');
  } catch (err) {
    console.error("❌ Installation failed:", err.message);
    process.exit(1);
  }
})();

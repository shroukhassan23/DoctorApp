const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  // Skip notarization in development or if credentials are missing
  if (process.env.CI !== 'true' || !process.env.APPLE_ID || !process.env.APPLE_ID_PASS) {
    console.log('Skipping notarization - missing credentials or not in CI environment');
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  try {
    await notarize({
      tool: 'notarytool',
      appBundleId: 'com.doctorapp.desktop',
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASS,
      teamId: process.env.APPLE_TEAM_ID,
    });
  } catch (error) {
    console.error('Notarization failed:', error);
    // Don't fail the build if notarization fails
  }
};
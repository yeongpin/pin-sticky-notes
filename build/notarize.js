const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  console.log("🔹 Starting notarization process...");

  const appName = context.packager.appInfo.productFilename;

  try {
    await notarize({
      appBundleId: "com.stickynotes.app",
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });
    console.log("✅ Notarization successful!");
  } catch (error) {
    console.error("❌ Notarization failed:", error);
    throw error;
  }
}; 
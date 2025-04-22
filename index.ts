import { registerRootComponent } from "expo";

import App from "./App";

// Add debug logging
console.log("App starting...");
console.log("Environment variables loaded:", {
  SUPABASE_URL: process.env.SUPABASE_URL ? "defined" : "undefined",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "defined" : "undefined",
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Server-safe: imported by the root layout as well as the client prefs store.
export const PREFS_KEY = "rr-prefs";

// Runs before first paint (inlined in <head>) so the saved theme never flashes.
export const themeBootScript = `try{var p=JSON.parse(localStorage.getItem("${PREFS_KEY}"));if(p&&p.theme)document.documentElement.dataset.theme=p.theme}catch(e){}`;

/**
 * Configuration for Chrome/Edge extensions to install in development mode
 *
 * To add an extension:
 * 1. Find the extension ID from the Chrome Web Store (in the URL)
 * 2. Add it to the array below with its name
 */

export interface ExtensionConfig {
  id: string
  name: string
  enabled?: boolean
}

export const EXTENSIONS_TO_INSTALL: ExtensionConfig[] = [
  {
    id: 'nhdogjmejiglipccpnnnanhbledajbpd', // Vue.js DevTools
    name: 'Vue.js DevTools',
    enabled: true
  }
  // Add more extensions here
  // {
  //   id: 'fmkadmapgofadopljbjfkapdkoienihi', // React Developer Tools
  //   name: 'React Developer Tools',
  //   enabled: true
  // },
  // {
  //   id: 'lmhkpmbekcpmknklioeibfkpmmfibljd', // Redux DevTools
  //   name: 'Redux DevTools',
  //   enabled: false
  // }
]


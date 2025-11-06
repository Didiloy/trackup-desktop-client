import { session } from 'electron'
import path from 'path'
import fs from 'fs'
import { Logger } from '../../shared/logger'
import { EXTENSIONS_TO_INSTALL } from '../config/extensions.config'

/**
 * Service to automatically download and install Chrome extensions
 * from the Chrome Web Store
 */
export class ExtensionService {
  private readonly extensionsDir: string
  private readonly logger: Logger

  constructor(extensionsDir: string) {
    this.extensionsDir = extensionsDir
    this.logger = new Logger('ExtensionService')
    this.ensureExtensionsDir()
  }

  /**
   * Creates the extensions directory if it doesn't exist
   */
  private ensureExtensionsDir(): void {
    if (!fs.existsSync(this.extensionsDir)) {
      fs.mkdirSync(this.extensionsDir, { recursive: true })
    }
  }

  /**
   * Loads an extension into Electron
   */
  private async loadExtension(extensionPath: string, extensionName: string): Promise<void> {
    try {
      await session.defaultSession.extensions.loadExtension(extensionPath, {
        allowFileAccess: true
      })
      // this.logger.info(`Extension "${extensionName}" loaded successfully (${extension.name})`)
    } catch (error) {
      throw new Error(`Failed to load extension "${extensionName}": ${error}`)
    }
  }

  /**
   * Attempts to load an extension from local Chromium-based browser installation
   */
  private async tryLoadFromChrome(extensionId: string, extensionName: string): Promise<boolean> {
    const possibleBasePaths = [
      // Chrome Windows
      path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data'),
      path.join(process.env.APPDATA || '', 'Google', 'Chrome', 'User Data'),
      // Edge Windows
      path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'User Data'),
      // Brave Windows
      path.join(process.env.LOCALAPPDATA || '', 'BraveSoftware', 'Brave-Browser', 'User Data'),
      // Opera Windows
      path.join(process.env.APPDATA || '', 'Opera Software', 'Opera Stable'),
      // Vivaldi Windows
      path.join(process.env.LOCALAPPDATA || '', 'Vivaldi', 'User Data'),
      // Chrome macOS
      path.join(process.env.HOME || '', 'Library', 'Application Support', 'Google', 'Chrome'),
      // Edge macOS
      path.join(process.env.HOME || '', 'Library', 'Application Support', 'Microsoft Edge'),
      // Brave macOS
      path.join(
        process.env.HOME || '',
        'Library',
        'Application Support',
        'BraveSoftware',
        'Brave-Browser'
      ),
      // Opera macOS
      path.join(
        process.env.HOME || '',
        'Library',
        'Application Support',
        'com.operasoftware.Opera'
      ),
      // Vivaldi macOS
      path.join(process.env.HOME || '', 'Library', 'Application Support', 'Vivaldi'),
      // Chrome Linux
      path.join(process.env.HOME || '', '.config', 'google-chrome'),
      // Chromium Linux
      path.join(process.env.HOME || '', '.config', 'chromium'),
      // Brave Linux
      path.join(process.env.HOME || '', '.config', 'BraveSoftware', 'Brave-Browser'),
      // Opera Linux
      path.join(process.env.HOME || '', '.config', 'opera'),
      // Vivaldi Linux
      path.join(process.env.HOME || '', '.config', 'vivaldi')
    ]

    // this.logger.debug(`Searching for extension "${extensionName}" (${extensionId})...`)
    // this.logger.debug(`Checking ${possibleBasePaths.length} possible browser locations...`)

    for (const basePath of possibleBasePaths) {
      if (!fs.existsSync(basePath)) {
        // this.logger.debug(`Path does not exist: ${basePath}`)
        continue
      }

      // this.logger.debug(`Checking browser path: ${basePath}`)

      // Check Default profile and other profiles
      const profiles = ['Default', 'Profile 1', 'Profile 2', 'Profile 3', 'Profile 4', 'Profile 5']

      for (const profile of profiles) {
        const extensionBasePath = path.join(basePath, profile, 'Extensions', extensionId)

        if (fs.existsSync(extensionBasePath)) {
          // this.logger.info(`Found extension folder at: ${extensionBasePath}`)

          try {
            // Find the latest version
            const versions = fs.readdirSync(extensionBasePath).filter((v) => {
              const versionPath = path.join(extensionBasePath, v)
              try {
                return fs.statSync(versionPath).isDirectory()
              } catch {
                return false
              }
            })

            if (versions.length === 0) {
              this.logger.error(`No valid version folders found in ${extensionBasePath}`)
              continue
            }

            // this.logger.debug(`Found ${versions.length} version(s): ${versions.join(', ')}`)

            // Sort versions semantically (latest first)
            const latestVersion = versions
              .sort((a, b) => {
                const aParts = a.split(/[._]/).map(Number)
                const bParts = b.split(/[._]/).map(Number)
                for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                  const aNum = aParts[i] || 0
                  const bNum = bParts[i] || 0
                  if (aNum !== bNum) return bNum - aNum
                }
                return 0
              })
              .shift()

            if (!latestVersion) {
              continue
            }

            const extensionPath = path.join(extensionBasePath, latestVersion)
            // this.logger.info(`Attempting to load version ${latestVersion} from: ${extensionPath}`)

            // Check if manifest exists
            const manifestPath = path.join(extensionPath, 'manifest.json')
            if (!fs.existsSync(manifestPath)) {
              this.logger.warn(`manifest.json not found in ${extensionPath}`)
              continue
            }

            try {
              await this.loadExtension(extensionPath, extensionName)
              return true
            } catch (error) {
              this.logger.error(
                `Could not load extension from ${extensionPath}: ${error instanceof Error ? error.message : String(error)}`
              )
            }
          } catch (error) {
            this.logger.error(
              `Error reading extension directory ${extensionBasePath}: ${error instanceof Error ? error.message : String(error)}`
            )
          }
        }
      }
    }

    this.logger.error(
      `Extension "${extensionName}" not found in any Chromium-based browser profile`
    )
    return false
  }

  /**
   * Installs all configured extensions
   */
  async installExtensions(): Promise<void> {
    const enabledExtensions = EXTENSIONS_TO_INSTALL.filter((ext) => ext.enabled !== false)

    if (enabledExtensions.length === 0) {
      this.logger.error('No extensions to install')
      return
    }

    this.logger.info(`Installing ${enabledExtensions.length} extension(s)...`)

    for (const extension of enabledExtensions) {
      try {
        // Try to load from local Chrome/Edge first
        const loadedFromChrome = await this.tryLoadFromChrome(extension.id, extension.name)

        if (!loadedFromChrome) {
          this.logger.error(
            `Extension "${extension.name}" not found locally. Please install it in Chrome/Edge first.`
          )
        }
      } catch (error) {
        this.logger.error(
          `Error installing extension "${extension.name}": ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    this.logger.info('Extension installation completed')
  }

  /**
   * Lists all loaded extensions
   */
  listLoadedExtensions(): void {
    const extensions = session.defaultSession.extensions.getAllExtensions()
    this.logger.info(`Loaded extensions (${extensions.length}):`)
    extensions.forEach((ext) => {
      this.logger.info(`  - ${ext.name} (${ext.id}) v${ext.version}`)
    })
  }
}

import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { WebpackPlugin } from '@electron-forge/plugin-webpack'

import { mainConfig } from './webpack.main.config'
import { rendererConfig } from './webpack.renderer.config'

const config: ForgeConfig = {
  packagerConfig: {
    icon: './src/icons/markdown'
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: './src/icons/markdown.ico',
      authors: 'crazycodegame',
      description: 'A lightweight cross-platform markdown editor'
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({
      options: {
        icon: './src/icons/markdown.png'
      }
    })
  ],
  plugins: [
    new WebpackPlugin({
      devContentSecurityPolicy:
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:;img-src 'self' data: base64 atom:;",
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts'
            }
          }
        ]
      }
    })
  ]
}

export default config

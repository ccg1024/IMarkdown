import { HeadInfo } from 'src/types/main'
import { FileCache, OpenFileType } from './menu/menu-callback'
import { MarkFile, existProp } from './tools'

export function getFileCacheProxyHandler() {
  const handler: ProxyHandler<FileCache> = {
    get(target: FileCache, p: string, _reciver: any) {
      if (p in target) {
        return target[p]
      }
      return null
    },
    set(
      target: FileCache,
      p: string,
      value: OpenFileType,
      _reciver: any
    ): boolean {
      try {
        if (p in target) {
          const { fileInfo, fileData } = value

          // update fileInfo
          if (fileInfo) {
            let key: keyof MarkFile
            for (key in fileInfo) {
              if (existProp(fileInfo, key)) {
                target[p].fileInfo[key] = fileInfo[key]
              }
            }
          }

          // update fileData
          if (fileData) {
            const { headInfo, ...rest } = fileData

            // update headInfo
            if (headInfo) {
              let key: keyof HeadInfo
              for (key in headInfo) {
                if (existProp(headInfo, key)) {
                  target[p].fileData.headInfo[key] = headInfo[key]
                }
              }
            }

            // update rest
            if (rest) {
              const { content, isChange, scrollPos } = rest
              if (content !== null && content !== undefined) {
                target[p].fileData.content = content
              }
              if (isChange !== null && isChange !== undefined) {
                target[p].fileData.isChange = isChange
              }
              if (scrollPos !== null && scrollPos !== undefined) {
                target[p].fileData.scrollPos = scrollPos
              }
            }
          }
        } else {
          // new prop
          target[p] = value
        }
      } catch {
        return false
      }
      return true
    },
    deleteProperty(target: FileCache, p: string): boolean {
      try {
        delete target[p]
      } catch {
        return false
      }
    }
  }

  return handler
}

import { useState, useEffect } from 'react'
import { MarkFile } from 'src/types'

type GitCommadMsg = {
  stderr: string
  stdout: string
}

export const useGitBranch = (initBranch: string, dirlist: MarkFile[]) => {
  const [branch, setBranch] = useState(initBranch)

  useEffect(() => {
    if (!dirlist || !dirlist.length) {
      return
    }
    window.ipcAPI
      .gitPipeline({ type: 'head', cwd: dirlist[0].id })
      .then(res => {
        const { out } = res
        const gitMsg = JSON.parse(out) as GitCommadMsg
        setBranch(gitMsg.stdout.trim())
      })
      .catch(() => {
        // TODO: add a message alert
        setBranch(initBranch)
      })
  }, [dirlist])

  return branch
}

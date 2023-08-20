// support git operation
import { exec } from 'child_process'

type ExecOptions = {
  cwd?: string
}

export class Git {
  private branch: string

  constructor() {
    this.branch = ''
  }
  /**
   * Using promise to wrap function `exec`
   *
   * @param cmd The commad which need be execute
   * @param options Some option param for `exec` function
   * @returns Execution result of cmd, a string type
   * */
  async promiseExec(cmd: string, options?: ExecOptions): Promise<string> {
    const { cwd } = options

    return new Promise((resolve, reject) => {
      exec(cmd, { cwd: cwd || process.cwd() }, (err, stdout, stderr) => {
        if (err) {
          reject(err.message)
        }

        resolve(JSON.stringify({ stderr, stdout }))
      })
    })
  }

  /**
   * Get current branch name with: git rev-parse --abbrev-ref HEAD
   *
   * @param options Some option param for `exec` function
   * @returns A promise that resolve a branch name if a git tree was detected, undefined if no .git was detected
   */
  async getHead(options?: ExecOptions): Promise<string> {
    this.branch = await this.promiseExec(
      'git rev-parse --abbrev-ref HEAD',
      options
    )
    return this.branch
  }

  /**
   * Make a git commit with: git commit -m `msg`
   *
   * @param msg commit message
   * @param options Some option param for `exec` function
   * @returns A promise that resolve a commit result if a git tree was detected
   * */
  async commit(msg: string, options?: ExecOptions): Promise<string> {
    return this.promiseExec(`git commit -m '${msg}'`, options)
  }

  /**
   * Make a git add with: git add `file`
   *
   * @param file The file which need be add by git
   * @param options Some option param for `exec` function
   * @returns A promise that resolve a git add result if a git tree was detected
   * */
  async addOne(file: string, options?: ExecOptions): Promise<string> {
    return this.promiseExec(`git add ${file}`, options)
  }

  /**
   * Pull repo of current branch with: git pull origin `branch`
   *
   * @param options Some option param for `exec` function
   * @returns A promise that resolve a git pull result if a git tree was detected
   * */
  async pull(options?: ExecOptions): Promise<string> {
    if (!this.branch) {
      return this.promiseExec('git pull', options)
    }
    return this.promiseExec(`git pull origin ${this.branch.trimEnd()}`, options)
  }

  /**
   * Push local repo to remote branch with: git push -u origin `branch`
   *
   * @param options Some option param for `exec` function
   * @returns A promise that resolve a git push result if a git tree was detected
   * */
  async push(options?: ExecOptions): Promise<string> {
    if (!this.branch) {
      return this.promiseExec('git push', options)
    }
    return this.promiseExec(
      `git push -u origin ${this.branch.trimEnd()}`,
      options
    )
  }
}

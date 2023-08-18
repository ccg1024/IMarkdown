/**
 * Try to make a OLOO(Objects Linked to Other Objects) style code in typescript.
 * But as far as current knowledge is concerned, typescript seems to be more
 * suitable to use classes to write.
 *
 * If not using `class`, the `this` type will be set with any, need to declare manually.
 *
 * Usage
 * const git: PromiseGitType = Object.create(PromiseGit)
 *
 * @author crazycodegame
 */
import { exec } from 'child_process'

type ExecOpts = {
  cwd?: string
}

export interface Git<T> {
  /**
   * Get current branch name
   *
   * @param opt Optional arguments to function `exec`
   * @returns Branch name, if exist, or a error message
   */
  getHead(opt?: ExecOpts): T

  /**
   * Get current status of git workspace
   *
   * @param opt Optional arguments to function `exec`
   * @returns Status result, if exist, or a error message
   */
  getStatus(opt?: ExecOpts): T

  /**
   * Stage `filepath` with: git add `filepath`
   *
   * @param filepath The file path which need to be stage
   * @param opt Optional arguments to function `exec`
   * @returns A stage result, if success, or a error message
   */
  addOne(filepath: string, opt?: ExecOpts): T

  /**
   * Make a commit with: git commit -m '`msg`'
   *
   * @param msg Commit message
   * @param opt Optional arguments to function `exec`
   * @returns A commit result, if success, or a error message
   */
  commit(msg: string, opt?: ExecOpts): T

  /**
   * Make a push with: git push -u origin <branch name>
   *
   * @param opt Optional arguments to function `exec`
   * @returns A push result, if success, or a error message
   */
  push(opt?: ExecOpts): T

  /**
   * Make a pull with: git pull, if `this.branch` is empty, git pull origin `this.branch`, if not
   *
   * @param opt Optional arguments to function `exec`
   * @returns A pull result, if success, or a error message
   */
  pull(opt?: ExecOpts): T
}

export interface PromiseGitType extends Git<Promise<string>> {
  branch: string

  /**
   * Using promise to wrap `exec`, which is callback version
   *
   * @param cmd The commad which need be execute
   * @param opt Optional arguments to function `exec`
   * @returns A promise that resolve execution result, if sucess, or a error message
   */
  promiseExec(cmd: string, opt?: ExecOpts): Promise<string>
}

export const PromiseGit: PromiseGitType = {
  branch: '',
  async promiseExec(cmd: string, opt?: ExecOpts) {
    const { cwd } = opt
    return new Promise((resolve, reject) => {
      exec(cmd, { cwd: cwd || process.cwd() }, (error, stdout, stderr) => {
        if (error || stderr) {
          reject(error ? error.message : stderr)
        }

        resolve(stdout)
      })
    })
  },
  async getHead(this: PromiseGitType, opt?: ExecOpts) {
    if (!this.branch) {
      this.branch = await this.promiseExec(
        'git rev-parse --abbrev-ref HEAD',
        opt
      )
    }
    return this.branch
  },
  async getStatus(this: PromiseGitType, opt?: ExecOpts) {
    return this.promiseExec('git status', opt)
  },
  async addOne(this: PromiseGitType, filepath: string, opt?: ExecOpts) {
    return this.promiseExec(`git add ${filepath}`, opt)
  },
  async commit(this: PromiseGitType, msg: string, opt?: ExecOpts) {
    return this.promiseExec(`git commit -m '${msg}'`, opt)
  },
  async push(this: PromiseGitType, opt?: ExecOpts) {
    if (!this.branch) {
      await this.getHead(opt)
    }
    return this.promiseExec(`git push -u origin ${this.branch}`, opt)
  },
  async pull(this: PromiseGitType, opt?: ExecOpts) {
    if (!this.branch) {
      return this.promiseExec('git pull', opt)
    }
    return this.promiseExec(`git pull origin ${this.branch}`, opt)
  }
}

import { HeadInfo } from 'src/types'

export function formateDate(date: Date | string): string {
  if (typeof date === 'string') {
    return date
  }

  if (date instanceof Date) {
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    month = month < 10 ? +`0${month}` : month
    day = day < 10 ? +`0${day}` : day
    return `${year}-${month}-${day}`
  }

  return null
}

export function concatHeaderAndContent(
  header: HeadInfo<string>,
  content: string
): string {
  let result = '---\n'
  let key: keyof HeadInfo<string>
  for (key in header) {
    if (header[key]) {
      if (header[key] instanceof Array) {
        result += `${key}: ${JSON.stringify(header[key])}\n`
      } else if (typeof header[key] === 'string') {
        result += `${key}: '${header[key]}'\n`
      } else {
        result += `${key}: ${header[key]}\n`
      }
    }
  }
  result += '---\n'
  return result + content
}

// copy from src/window/tools.ts
// because need using on render process, but can not import module fs, readline, etc.
export function copyProp<T, K extends keyof T>(dist: T, src: T, key: K) {
  dist[key] = src[key]
}

export function formatGitOut(out: string) {
  const outObj = JSON.parse(out)
  const keys = ['stderr', 'stdout']
  let res = ''
  keys.forEach(key => {
    res += `${outObj[key]}`
  })

  return res
}

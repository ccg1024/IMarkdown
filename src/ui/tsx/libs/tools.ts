import { RecentFilesPayload } from '../../app/reducers/recentFilesSlice'

export function formatedTime(dateObj?: Date | string): string {
  if (typeof dateObj === 'string') {
    return dateObj
  }
  if (dateObj instanceof Date) {
    const timeObj = dateObj
    const year = timeObj.getFullYear()
    let month: string | number = timeObj.getMonth() + 1
    let day: string | number = timeObj.getDate()
    month = month > 9 ? month : '0' + month
    day = day > 9 ? day : '0' + day
    return [year, month, day].join('-')
  }

  return null
}

export function concatHeadAndContent(
  head: RecentFilesPayload,
  content: string
): string {
  const headInfo: any = {
    title: head.title,
    desc: head.desc,
    date: head.date
  }
  let result = '---\n'
  for (const key in headInfo) {
    if (headInfo[key]) {
      result += `${key}: ${headInfo[key]}\n`
    }
  }
  result += '---\n'
  return result + content
}

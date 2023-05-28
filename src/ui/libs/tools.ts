import { RecentFilesPayload } from '../app/reducers/recentFilesSlice'

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
  header: RecentFilesPayload,
  content: string
): string {
  const subHeader: any = {
    title: header.title,
    desc: header.desc,
    date: header.date
  }
  let result = '---\n'
  for (const key in subHeader) {
    if (subHeader[key]) {
      result += `${key}: ${subHeader[key]}\n`
    }
  }
  result += '---\n'
  return result + content
}

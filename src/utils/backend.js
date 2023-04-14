function logTime() {
  const current = new Date()

  const year = current.getFullYear()
  const month = current.getMonth() + 1
  const day = current.getDate()
  const hour =
    current.getHours() > 9 ? current.getHours() : '0' + current.getHours()
  const minute =
    current.getMinutes() > 9 ? current.getMinutes() : '0' + current.getMinutes()
  const seconde =
    current.getSeconds() > 9 ? current.getSeconds() : '0' + current.getSeconds()

  return [year, month, day].join('-') + ' ' + [hour, minute, seconde].join(':')
}

module.exports = {
  logTime
}

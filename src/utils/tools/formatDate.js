function formatDate(theDate) {
  const date = theDate ? new Date(theDate) : new Date()
  const pad = (num) => String(num).padStart(2, '0')

  const yy = String(date.getFullYear())
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const min = pad(date.getMinutes())
  const ss = pad(date.getSeconds())

  return `${yy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

// 导出函数
export default formatDate

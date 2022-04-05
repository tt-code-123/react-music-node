/*
得到指定数组的分页信息对象
 */
function pageFilter(arr, pageNum, pageSize) {
  pageNum = pageNum * 1
  pageSize = pageSize * 1
  const total = arr.length
  const pages = Math.floor((total + pageSize - 1) / pageSize)
  const start = pageSize * (pageNum - 1)
  const end = start + pageSize <= total ? start + pageSize : total
  const list = []
  for (var i = start; i < end; i++) {
    list.push(arr[i])
  }

  return {
    pageNum,
    total,
    pages,
    pageSize,
    list
  }
}

function checkFormat(str) {
  if (/^[a-zA-Z]*$/.test(str)) {
    return 0
  }
  else if (/^[\u4e00-\u9fa5]*$/.test(str)) {
    return 1
  }
}

exports.pageFilter = pageFilter
exports.checkFormat = checkFormat
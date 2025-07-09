export function report({ requestFn, options }) {
  console.log('report', options)
  return new Promise((resolve, reject) => {
    requestFn({
      ...options,
      timeout: 10000,
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

const judgeNumber = (value, defaultValue) => {
  if (isNaN(value)) {
    return defaultValue !== null ? defaultValue : null
  }
  return value
}

const judgeString = (value, defaultValue) => {
  if (typeof value === 'undefined') {
    return defaultValue !== null ? defaultValue : null
  }
  return value
}

const judgeBoolean = (value, defaultValue) => {
  if (typeof value === 'undefined') {
    return defaultValue !== null ? defaultValue : false
  }
  return value === 'true'
}

const judgeArray = (value, defaultValue) => {
  if (typeof value === 'undefined') {
    return defaultValue !== null ? defaultValue : null
  }
  return value
}

export default (...args) => (target, name, description) => {
  const oldFunction = description.value
  description.value = function() {
    const params = args.map(arg => {
      let value = null
      if (typeof arg === 'string') {
        // 简单的判断
        value = this.ctx.query[arg]
        return typeof value === 'undefined' ? null : value
      }
      const {
        type = null,
        name,
        defaultValue = null,
      } = arg
      if (type === null) { return null }
      switch (type) {
        case Number:
          value = judgeNumber(Number(this.ctx.query[name]), defaultValue)
          break;
        case String:
          value = judgeString(this.ctx.query[name], defaultValue)
          break;
        case Boolean:
          value = judgeBoolean(this.ctx.query[name], defaultValue)
          break;
        case Array:
          value = judgeArray(this.ctx.queries[name], defaultValue)
          break;
      }
      return value
    })

    return oldFunction.apply(this, params)
  }
  return description
}
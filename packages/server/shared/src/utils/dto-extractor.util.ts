/**
 * DTO 字段提取工具
 * 用于从 DTO 类定义中自动获取所有字段（包括继承的字段）
 */

/**
 * 从 DTO 类定义中获取所有属性（包括继承链中的所有属性）
 */
export function getAllDtoProperties<T>(dtoClass: new (...args: any[]) => T): string[] {
  const properties = new Set<string>()

  // 遍历整个继承链
  let currentClass = dtoClass
  while (currentClass && currentClass.prototype) {
    // 获取当前类的实例属性
    try {
      const instance = new currentClass()
      const instanceProps = Object.getOwnPropertyNames(instance)
      instanceProps.forEach((prop) => {
        if (prop !== 'constructor' && prop !== '__proto__' && !prop.startsWith('__')) {
          properties.add(prop)
        }
      })
    } catch (e) {
      // 如果无法创建实例，尝试从原型获取
      console.warn(`Cannot create instance of ${currentClass.name}, trying prototype properties`)
    }

    // 获取原型上的属性
    const prototypeProps = Object.getOwnPropertyNames(currentClass.prototype)
    prototypeProps.forEach((prop) => {
      if (prop !== 'constructor' && prop !== '__proto__' && !prop.startsWith('__')) {
        properties.add(prop)
      }
    })

    // 移动到父类
    currentClass = Object.getPrototypeOf(currentClass)

    // 停止条件：到达 Object 或 Function
    if (!currentClass || currentClass.name === 'Object' || currentClass.name === 'Function') {
      break
    }
  }

  return Array.from(properties)
}

/**
 * 通过 DTO 类定义自动提取字段的工具方法
 * @param data 原始数据对象
 * @param dtoClass DTO 类
 * @returns 映射后的数据对象
 */
export function extractFieldsFromDto<T extends Record<string, any>>(
  data: any,
  dtoClass: new (...args: any[]) => T
): Record<string, any> {
  // 直接从 DTO 类定义中获取所有字段（包括继承的）
  const dtoProperties = getAllDtoProperties(dtoClass)

  // 从原始数据中提取 DTO 中定义的字段
  const extracted: Record<string, any> = {}

  for (const property of dtoProperties) {
    if (Object.prototype.hasOwnProperty.call(data, property)) {
      // 将驼峰命名转换为下划线命名
      const snakeKey = property.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      extracted[snakeKey] = data[property]
    }
  }

  return extracted
}

# requestMapping
利用`Decorator`的特性为egg制作了请求参数获取方法

由于使用了babel, 就也顺便增加了egg对于的 `import` / `export` 支持。开发可以在dev目录进行，运行`gulp`构建代码至app目录。`npm run dev`的启动目录依旧是app。

## Demo
```
'use strict';

import { Controller } from 'egg'
import GetMapping from '../decorators/GetMapping'

class HomeController extends Controller {
  @GetMapping({
    name: 'id',
    type: Number,
  }, {
    name: 'name',
    type: String,
    defaultValue: 'anonymous'
  }, {
    name: 'right',
    type: Boolean,
  }, {
    name: 'list',
    type: Array,
  })
  async index(id, name, right, list) {
    this.ctx.body = {
      code: 200,
      content: { id, name, right, list },
    };
  }
}

export default HomeController;
```

## 实现
### 1. Decorator
JS使用的装饰器(Decorator)很像Java的`@annotation`，其目的是可以在运行时改变类或者改变类的属性
> Decorators make it possible to annotate and modify classes and properties at design time.

要使用Decorator, 得安装Babel的`babel-plugin-transform-decorators-legacy`插件用于转译装饰器代码。如果实在VSCode环境下，还得配置`jsconfig.json`内`"compilerOptions.experimentalDecorators": true`

### 2. 使用
装饰器的使用非常简单，其本质上就是一个函数。

#### 1. 装饰类
```
function log(target, name, descriptor) {
  console.log(target)
  console.log(name)
  console.log(descriptor)
}

@log // 装饰类的装饰器
class Car {
  run() {
    console.log('Car is running')
  }
}

const c1 = new Car()
c1.run()
```

#### 2. 装饰类方法
```
function log(target, name, descriptor) {
  console.log(target)
  console.log(name)
  console.log(descriptor)
}

class Car {
  @log // 装饰类方法的装饰器
  run() {
    console.log('Car is running')
  }
}

const c1 = new Car()
c1.run()
```

### 3. 参数
装饰器函数有三个参数，其含义在装饰不同属性时表现也不用。
#### 1. 装饰类
在装饰类的时候，第一个参数表示类的函数本身。之前log输出如下:
![pic1](https://image.hduzplus.xyz/image/baeee0d3-a5ff-4353-b303-ad79c09848a3.png)

#### 2. 装饰属性
在装饰类方法的时候，第一个参数表示类的原型(prototype), 第二个参数表示方法名, 第三个参数表示被装饰参数的属性。之前log输出如下:
![pic2](https://image.hduzplus.xyz/image/5542103b-05c8-4ce3-8be6-59989a2a367f.png)

第三个参数内有如下属性:
1. configurable - 控制是不是能删、能修改descriptor本身。
2. writable - 控制是不是能修改值。
3. enumerable - 控制是不是能枚举出属性。
4. value - 控制对应的值，方法只是一个value是函数的属性。
5. get和set - 控制访问的读和写逻辑。

### 4. 动态修改
为什么说Decorator可以在运行时修改类或类的属性？主要是通过装饰器函数的返回值决定的。

#### 1. 装饰类
Decorator的返回值表示新的构造方法。在使用`babel-plugin-transform-decorators-legacy`的情况下, 如果返回值是 null/undefined/false/NaN/''/0/ 则会使用原本的构造函数。
![pic3](https://image.hduzplus.xyz/image/27870403-262c-480e-8051-5b3b655210d3.png)

使用构造器, 我们可以将小汽车动态改变为自行车。
```
function log(target, name, descriptor) {
  console.log(target)
  console.log(name)
  console.log(descriptor)
  return class Bike {
    run() {
      console.log('Bike is running')
    }
  }
}

@log
class Car {
  run() {
    console.log('Car is running')
  }
}

const c1 = new Car()
c1.run() // out: Bike is running
```

#### 2. 装饰成员属性
Decorator函数的返回值表示新的成员属性。如果返回值是 null/undefined/false/NaN/''/0/ 则会返回原本的成员属性。

Decorator在`babel-plugin-transform-decorators-legacy`的情况下对成员属性的动态修改实际上是通过`defineProperty`实现的。

如果被装饰的成员是函数，则第三个参数的value字段表示这个函数本身。基于此，我们可以使用Decorator做一些有意思的事。
##### 1. 日志输出
```
function log(target, name, descriptor) {
  console.log(Date.now())
}

class Car {
  @log
  run() {
    console.log('Car is running')
  }
}

const c1 = new Car()
c1.run()
```
##### 2. 函数劫持
```
function log(target, name, descriptor) {
  const old = descriptor.value
  descriptor.value = function(...arg) { // 注意这里需要保留原this作用域，不能使用箭头函数
    console.log('哈哈哈哈被我劫持啦')
    return old.apply(this, arg)
  }
}

class Car {
  @log
  run() {
    console.log('Car is running')
  }
}

const c1 = new Car()
c1.run()
```
##### 3. Cache
```
const memory = () => {
  const cache = Object.create(null)   // 利用闭包的特性，保留一个Object用于缓存函数返回值
  return (target, name, descriptor) => {
    const method = descriptor.value
    descriptor.value = (...args) => {
      const key = args.join('')
      if (cache[key]) {
        return cache[key]
      }
      const ret = method.apply(target, args)
      cache[key] = ret
      return ret
    }
    return descriptor
  }
}

class A {
  @memory() // 实际上是memory函数的返回值作为装饰器
  fib(n) {
    if (n === 1) return 1
    if (n === 2) return 1
    return this.fib(n - 1) + this.fib(n - 2)
  }
}

const a = new A()
console.log(a.fib(100)) // 算的飞快！
```


### 5. 实现RequestMapping思路
1. 对Controller函数进行劫持
2. 根据装饰器传入的参数判断从ctx.query/ctx.queries内获取相应字段
3. 对获取到的字段进行判断，根据defaultValue设置相应默认值

其中最需要注意的就是this指向的问题。定义新的descriptor.value时必须用function定义而不能使用箭头函数，否则会丢失this指向从而导致无法获取到相应作用域。
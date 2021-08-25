# jsx语法规则

+ 定义虚拟dom时，不要写引号
+ 标签中混入js表达式时要用{}
+ 样式的类名指定不要用class，要用className
+ 内联样式，要用style={{key:value}}的格式写
+ 只有一个根标签
+ 标签必须闭合
+ 标签首字母
  + 若小写字母开头，则将改标签转为html中同名元素，若无，则报错
  + 若大写字母开头，react就去渲染对应的组件，若组件没有定义，则报错

# createRef

![image-20210719183623490](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210719183623490.png)

不要过度使用ref

可以用event.target代替

![image-20210719185305549](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210719185305549.png)

非受控组件（现用现取）

![image-20210719215844421](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210719215844421.png)

受控组件

页面中所有输入类的dom比如input框，这种dom随着你的输入能把东西维护到状态里面去，等用的时候直接去状态里面取出来

```javascript
let a = 'name'

let obj = {} // {name:'tom'}
obj[a] = 'tom'
console.log(obj) //{name:'tom'}
```

高阶函数

+ 若A函数，接受的参数是一个函数，那么A就可以称之为高阶函数

或

+ 若A函数，调用的返回值依然是一个函数，那么A就可以称之为高阶函数

常见的高阶函数有：promise,setTimeout,arr.map()等等

函数的柯里化：通过函数调用继续返回函数的方式，实现多次接受参数最后统一处理的函数编码形式。

![image-20210719222937591](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210719222937591.png)

onChange调用的是this.saveFormData('username')返回的函数

**不用柯里化的写法**

![image-20210719223443505](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210719223443505.png)

# 生命周期

![image-20210720095046395](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720095046395.png)

**![image-20210720155623764](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720155623764.png)**

shouldComponentUpdate 需要返回true，才能更新

![image-20210720165959913](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720165959913.png)

![image-20210720170007387](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720170007387.png)

生命周期汇总(旧)

![image-20210720170533339](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720170533339.png)

在新版本中需要加unsafe_前缀的钩子

![image-20210720172718987](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720172718987.png)

新生命周期和旧生命周期的对比

![image-20210720173629550](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720173629550.png)

废除了3个钩子，新增了两个钩子

新增的两个使用情况极少

getDerivedStateFromProps

![image-20210720175704467](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720175704467.png)

getSnapshotBeforeUpdate

在最近一次渲染输出（提交到dom节点）之前调用。它使得组件能在发生更改之前从dom中捕获一些信息（例如：滚动位置）。此生命周期的任何返回值将作为参数传递给componentDidUpdate()

此用法不常见

```javascript
componentDidUpdate(preProps,preState,snapshotValue){
    console.log('Count--componentDidUpdate',preProps,preState,snapshotValue)
}
```

# 生命周期（新）总结

![image-20210720183906414](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720183906414.png)

![image-20210720183915885](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720183915885.png)

# 脚手架

![image-20210720205911232](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210720205911232.png)

*连续解构赋值+重命名*

```javascript
 const {keyWorldElement:{value:keyWorld}} = this
```

# pubsub(消息订阅-发布机制)

工具库：PubSubJs

![image-20210726145258378](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210726145258378.png)

![image-20210726145309467](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210726145309467.png)

例子

Search

```javascript
search = ()=>{
        //获取用户的输入(连续解构赋值+重命名)
        const {keyWorldElement:{value:keyWorld}} = this
        // console.log(keyWorld)
        //发送请求前通知List更新状态
        PubSub.publish('atguigu',{isFirst:false,isLoading:true})
        //发送网络请求
        axios.get(`http://localhost:3000/api1/search/users?q=${keyWorld}`).then((res)=>{
        PubSub.publish('atguigu',{isLoading:false,users:res.data.items})
      },(err)=>{
        PubSub.publish('atguigu',{isLoading:false,err:err})
        })
    }
```

List

```javascript
  componentDidMount(){
    PubSub.subscribe('atguigu',(_,data)=>{
      this.setState(data)
    })
  }
```

GitHub案例总结

![image-20210726151957445](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210726151957445.png)

# React路由

安装 react-router-dom

![image-20210726174149296](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210726174149296.png)

## 路由组件与一般组件

路由组件和一般组件最大的区别就是路由组件会收到路由器给传递的三个最重要的props信息。分别是history,location,match。

![image-20210726180606889](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210726180606889.png)

### NavLink

绑定active样式

```javascript
<Navlink activeClassName="atguigu" className="???" to="/about">About</Navlink>
```

封装MyNavLink

```jsx
import React, { Component } from 'react'
import {NavLink} from 'react-router-dom'
export default class MyNavLink extends Component {
    render() {
        
        return (
            <NavLink  className="list-group-item" {...this.props}></NavLink>
        )
    }
}
```

使用：

```jsx
<MyNavLink to="/home">Home</MyNavLink>
```

## Switch

1. 通常情况下，path和component是一一对应的关系。
2. Switch可以提高路由匹配效率(单一匹配)。

## 多级路径刷新页面样式丢失的问题

![image-20210726185059907](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210726185059907.png)

## 路由的严格匹配与模糊匹配

![image-20210726190111311](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210726190111311.png)

## Redirect的使用

1. 一般写在所有路由注册的最下方，当所有路由都无法匹配时，跳转到Redirect指定的路由

2. 具体代码：

   ```javascript
   <Switch>
       <Route path="/about" component={About}/>
       <Route path="/home" component={Home}/>
       <Redirect to="/about"/>
   </Switch>
   ```

   

## 嵌套路由

组件写在上一级组件目录下

```javascript
             <div>
                 <h3>我是Home的内容</h3>
              <div>
                <ul className="nav nav-tabs">
                  <li>
                    <MyNavLink  to="/home/news">News</MyNavLink>
                  </li>
                  <li>
                  <MyNavLink  to="/home/message">Message</MyNavLink>
                  </li>
                </ul>
                <Switch>
                    <Route path="/home/news" component={News}></Route>
                    <Route path="/home/message" component={Message}></Route>
                </Switch>
              </div>
            </div>
```

1. 注册子路由时要写上父路由的path值
2. 路由的匹配是按照注册路由的顺序进行的

## 向路由组件传递参数

### params参数

Message

![image-20210727105450454](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727105450454.png)

Detail

**![image-20210727105542476](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727105542476.png)**

![image-20210727105650490](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727105650490.png)

### search参数

![image-20210727111322588](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727111322588.png)

![image-20210727111329422](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727111329422.png)

![image-20210727111426762](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727111426762.png)

### state参数

![image-20210727112348849](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727112348849.png)

![image-20210727112353487](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727112353487.png)

![image-20210727112405214](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727112405214.png)

![image-20210727112418852](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727112418852.png)

![image-20210727112513386](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727112513386.png)

## 编程式路由导航

调用props中的history里面的api

必须是路由组件才有这个方法

#### withRouter

withRouter可以加工一般组件，让一般组件具路由组件所持有的API

他的返回值是一个新组件

![image-20210727122936370](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727122936370.png)

## BrowsetRouter与HashRouter的区别

![image-20210727123957684](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727123957684.png)

## antd的按需引入+自定主题

![image-20210727155741534](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210727155741534.png)

# redux

![image-20210731125521082](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210731125521082.png)

![image-20210731125537478](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210731125537478.png)

![image-20210731131528733](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210731131528733.png)

## react-redux

![image-20210731143324616](C:\Users\yk\AppData\Roaming\Typora\typora-user-images\image-20210731143324616.png)

### 简写mapDispatch

```javascript
//使用connect()()创建并暴露一个Count的容器组件
export default connect(
	state => ({count:state}),

	//mapDispatchToProps的一般写法
	/* dispatch => ({
		jia:number => dispatch(createIncrementAction(number)),
		jian:number => dispatch(createDecrementAction(number)),
		jiaAsync:(number,time) => dispatch(createIncrementAsyncAction(number,time)),
	}) */

	//mapDispatchToProps的简写
	{
		jia:createIncrementAction,
		jian:createDecrementAction,
		jiaAsync:createIncrementAsyncAction,
	}
)(Count)
```

#### 5.求和案例_react-redux优化

​      (1).容器组件和UI组件整合一个文件

​      (2).无需自己给容器组件传递store，给<App/>包裹一个<Provider store={store}>即可。

​      (3).使用了react-redux后也不用再自己检测redux中状态的改变了，容器组件可以自动完成这个工作。

​      (4).mapDispatchToProps也可以简单的写成一个对象

​      (5).一个组件要和redux“打交道”要经过哪几步？

​              (1).定义好UI组件---不暴露

​              (2).引入connect生成一个容器组件，并暴露，写法如下：

​                  connect(

​                    state => ({key:value}), //映射状态

​                    {key:xxxxxAction} //映射操作状态的方法

​                  )(UI组件)

​              (4).在UI组件中通过this.props.xxxxxxx读取和操作状态


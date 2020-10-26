//定义全局变量
var sw = 20,    //一个方块的宽度
    sh = 20,    //一个方块的高度
    tr = 30,    //行数
    td = 30     //列数
var snake = null,   //蛇的实例
    food = null,    //食物的实例
    game = null     //游戏的实例

//定义方块构造函数来创建方块
function Square (x, y, classname) { //classname表示单独的样式
    // 0,0  0,0
    //20,0  1,0
    //40,0  2,0     此处需要将像素值的坐标进行转换
    this.x = x * sw
    this.y = y * sh
    this.class = classname

    this.viewContent = document.createElement('div')    //创建页面中的小方块对应的DOM元素
    this.viewContent.className = this.class
    this.parent = document.getElementById('snake-wrapper')  //方块的父级
}

Square.prototype.create = function () { //创建方块DOM，并且添加到页面
    this.viewContent.style.position = 'absolute'
    this.viewContent.style.width = sw + 'px'
    this.viewContent.style.height = sh + 'px'
    this.viewContent.style.left = this.x + 'px'
    this.viewContent.style.top = this.y + 'px'

    this.parent.appendChild(this.viewContent)
}

Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent)
}

//定义蛇的构造函数来创建蛇
function Snake () {
    this.head = null    //存储蛇头信息
    this.tail = null    //存储蛇尾信息
    this.pos = []   //存储蛇身上每个方块的位置信息
    this.directionNum = {   //存储蛇走的方向，用一个对象来表示
        left: {
            x: -1,
            y: 0
        },
        right: {
            x: 1,
            y: 0
        },
        up: {
            x: 0,
            y: -1
        },
        down: {
            x: 0,
            y: 1
        }
    }
}

//初始化，用来创建一些默认的信息
Snake.prototype.init = function () {
    //创建蛇头
    var snakeHead = new Square(2,0,'snake-head')
    snakeHead.create()
    this.head = snakeHead   //存储蛇头信息
    this.pos.push([2,0])    //把蛇头的位置信息存储起来

    //创建蛇身1
    var snakeBody1 = new Square(1,0,'snake-body')
    snakeBody1.create()
    this.pos.push([1,0])    //把蛇身1的位置信息存储起来

    //创建蛇身2
    var snakeBody2 = new Square(0,0,'snake-body')
    snakeBody2.create()
    this.tail = snakeBody2  //把蛇尾的信息进行更新
    this.pos.push([0,0])    //把蛇身2的位置信息存储起来

    //形成链表关系
    snakeHead.last = null
    snakeHead.next = snakeBody1
    snakeBody1.last = snakeHead
    snakeBody1.next = snakeBody2
    snakeBody2.last = snakeBody1
    snakeBody2.next = null

    //给蛇添加一条属性，用来表示蛇默认走的方向
    this.direction = this.directionNum.right
}

//用来获取蛇头的下一个位置对应元素，根据元素做不同的事情
Snake.prototype.getNextPos = function () {
    var nextPos = [ //蛇头要走的下一个点的坐标
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ]

    //下个点是自己，代表撞到自己，游戏结束
    var selfCollied = false
    this.pos.forEach(function(value){
        if(value[0] == nextPos[0] && value[1] == nextPos[1]){   //如果数组中的两个数据都相等就代表下一个点是自己
            selfCollied = true
        }
    })
    if(selfCollied == true){

        this.strategies.die.call(this)

        return;     //用于跳出代码，下面的判断都不会进行
    }

    //下个点是墙，游戏结束
    if(nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1){
        
        this.strategies.die.call(this)

        return      //功能同上
    }

    //下个点是食物，吃
    if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]){
        this.strategies.eat.call(this)
        return
    }

    // 下个点什么都不是，继续走
    this.strategies.move.call(this)
}

//处理碰撞后要做的事
Snake.prototype.strategies = {
    move : function (format) {  //这个参数用来决定是否删除蛇尾，传了这个参数之后表示要做的事情是吃
        //在旧蛇头的位置创建新身体
        var newBody = new Square(this.head.x/sw,this.head.y/sh,'snake-body')
        //更新链表的关系
        //解释：在蛇头没有被移除之前，新的newbody的位置就是原来蛇头的位置
        //所以newBody.next = this.head.next
        //所以newbody的左边的右边就是newbody
        //所以newbody的右边此时什么都没有则为空
        //next 表示左边 last表示右边
        newBody.next = this.head.next
        newBody.next.last = newBody
        newBody.next = null

        this.head.remove()
        newBody.create()

        //创建一个新蛇头（蛇头下一个要到的点）
        var newHead = new Square(this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y,'snake-head')
        newHead.create()
        //更新链表的关系
        newHead.next = newBody
        newHead.last = null
        newBody.last = newHead
        //更新蛇身每一个方块的坐标
        this.pos.splice(0, 0, [this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y])
        this.head = newHead     //蛇头的信息同样需要更新

        //删除蛇尾（即蛇的最后一个身体）
        if(!format){    //如果format的值为false表示需要删除蛇尾（除了吃之外的操作）
            this.tail.remove()
            //更新链表的关系
            this.tail = this.tail.last
            //更新数组pos
            this.pos.pop()
        }
    },
    eat : function () {
        this.strategies.move.call(this,true)
        createFood()
        game.score++
    },
    die : function () {
        game.over()
    }
}
snake = new Snake()

//创建食物
function createFood () {
    //食物小方块的随机坐标
    var x = null
    var y = null
    var include = true  //跳出循环的条件，true表示食物在蛇身上（继续循环），false表示食物不在蛇身上（不进行循环了）
    while(include){
        x = Math.round(Math.random()*(td - 1))
        y = Math.round(Math.random()*(tr - 1))

        snake.pos.forEach(function (value){
            if(x != value[0] && y != value[1]){
                //该条件用来判断食物的生成位置并不在蛇身上
                include = false
            }
        })
    }
    //随机生成食物
    food = new Square(x, y, 'snake-food')
    food.pos = [x,y]    //存储食物的坐标用于和蛇头做对比
    var foodDom = document.querySelector('.snake-food')
    if(foodDom){
        foodDom.style.left = x * sw + 'px'
        foodDom.style.top = y * sh + 'px'
    }else{
        food.create()
    }
}

//创建游戏逻辑
function Game () {
    this.timer = null
    this.score = 0
}
Game.prototype.init = function () {
    snake.init()
    createFood()
    document.onkeydown = function (ev) {
        if(ev.which == 37 && snake.direction != snake.directionNum.right){  //37表示鼠标左键，限定往按键的反方向走的时候不能往按键方向走
            snake.direction = snake.directionNum.left
        }else if(ev.which == 38 && snake.direction != snake.directionNum.down){
            snake.direction = snake.directionNum.up
        }else if(ev.which == 39 && snake.direction != snake.directionNum.left){
            snake.direction = snake.directionNum.right
        }else if(ev.which == 40 && snake.direction != snake.directionNum.up){
            snake.direction = snake.directionNum.down
        }
    }

    this.start()
}
Game.prototype.start = function () {
    this.timer = setInterval(function timer() {
        snake.getNextPos()
    },200)
}
Game.prototype.pause = function () {
    clearInterval(this.timer)
}
Game.prototype.over = function () {
    clearInterval(this.timer)
    alert('你的得分为：'+ this.score * 1000)

    //游戏回到初始状态
    var snakeWrap = document.getElementById('snake-wrapper')
    snakeWrap.innerHTML = ''
    snake = new Snake()
    game = new Game()
    var startBtnWrap = document.querySelector('.startBtn')
    startBtnWrap.style.display = 'block'
}

//开启游戏
game = new Game()
var startBtn = document.querySelector('.startBtn button')
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none'
    game.init()
}

//暂停游戏
var snakeWrap = document.getElementById('snake-wrapper')
var pauseBtn = document.querySelector('.pauseBtn button')

snakeWrap.onclick = function () {
    game.pause()
    pauseBtn.parentNode.style.display = 'block'
}

//暂停后继续游戏
pauseBtn.onclick = function () {
    game.start()
    pauseBtn.parentNode.style.display = 'none'
}
<template>
  <div class="Custom2048">
    <canvas ref="chessBoard" width="360" height="360"></canvas>
    <canvas ref="tiles" width="360" height="360"></canvas>
  </div>
</template>
<script lang="ts">
import Vue,{ Component } from 'vue';
const ROW = 4
const COL = 4

/*
 *  待解决：  1、没有检查canMoving(√)
 *            2、移动端像素比(√)
 *            3、动画效果
 *            4、...
 *
 */

function getListener () {
  const KEYDOWN = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  }
  let startX, startY
  return {
    touchstart: (e) => {
      // 防止滑动时，移动端页面上下抖动
      e.preventDefault()
      startX = e.touches[0].pageX
      startY = e.touches[0].pageY
    },
    touchend: (e) => {
      e.preventDefault()

      let direction = null
      let endX = e.changedTouches[0].pageX
      let endY = e.changedTouches[0].pageY
      let horizontal = endX - startX
      let vertical = endY - startY
      // 当touchend坐标偏移小于5像素时，不触发movingtiles事件。
      if (Math.abs(horizontal) <= 5 && Math.abs(vertical) <= 5) {
        return
      }
      if (Math.abs(horizontal) > Math.abs(vertical)) {
        if (horizontal > 0) {
          direction = 'RIGHT'
        } else if (horizontal < 0) {
          direction = 'LEFT'
        }
      } else if (Math.abs(horizontal) < Math.abs(vertical)) {
        if (vertical > 0) {
          direction = 'DOWN'
        } else if (vertical < 0) {
          direction = 'UP'
        }
      }
      this.$emit('movingtiles', direction)
    },
    keydown: (e) => {
      switch (e.keyCode) {
        case KEYDOWN.UP:
          this.$emit('movingtiles', 'UP')
          break
        case KEYDOWN.RIGHT:
          this.$emit('movingtiles', 'RIGHT')
          break
        case KEYDOWN.DOWN:
          this.$emit('movingtiles', 'DOWN')
          break
        case KEYDOWN.LEFT:
          this.$emit('movingtiles', 'LEFT')
          break
      }
    }
  }
}


const components = Vue.extend( {
  data () {
    return {
      emptyGrids: null,
      grids: null,
      listener: getListener.call(this),
      canvasRealSize: null,
      moveable: false
    }
  },
  methods: {
    start () {
      this.$nextTick(() => {
        let {REAL_WIDTH} = this.canvasRealSize
        let canvas = this.$refs.tiles
        let ctx = canvas.getContext('2d')

        // 清除tiles
        ctx.clearRect(0, 0, REAL_WIDTH, REAL_WIDTH)
        // 初始化grids数组
        this.grids = JSON.parse(JSON.stringify(this.emptyGrids))

        // 取消事件监听
        this.eventListenerSwitch('off')
        // 添加监听事件
        this.eventListenerSwitch()

        // 随机生成数字
        this.generateGridNumber(ctx)
        this.generateGridNumber(ctx)
      })
    },
    initChessBoard () {
      this.$nextTick(() => {
        let {REAL_WIDTH} = this.canvasRealSize
        let chessBoard = this.$refs.chessBoard
        let ctx = chessBoard.getContext('2d')

        ctx.fillStyle = '#bbada0'
        ctx.fillRect(0, 0, REAL_WIDTH, REAL_WIDTH)
        let grids = []

        for (let i = 0; i < ROW; i++) {
          grids[i] = []
          for (let j = 0; j < COL; j++) {
            grids[i][j] = null
            let rect = this.getBoundingClientRect(i, j)
            this.drawRoundingRect({ctx, rect})
          }
        }
        this.emptyGrids = grids
      })
    },
    drawGameover (ctx) {
      let {REAL_WIDTH, RATIO} = this.canvasRealSize
      let gameoverText = '游戏结束'
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, REAL_WIDTH, REAL_WIDTH)
      ctx.fillStyle = 'white'
      ctx.font = `Microsoft YaHei bold ${60 * RATIO}px`
      let text = ctx.measureText(gameoverText)
      ctx.fillText(gameoverText, REAL_WIDTH / 2 - text.width / 2, REAL_WIDTH / 2)
      this.eventListenerSwitch('off')
    },
    drawRoundingRect (options) {
      // 圆角矩形...
      let {ctx, rect, radius = 6, fillStyle = '#ccc0b3'} = options
      let {left, right, top, bottom} = rect
      ctx.fillStyle = fillStyle
      ctx.beginPath()
      ctx.moveTo(left, top + radius)
      ctx.quadraticCurveTo(left, top, left + radius, top)
      ctx.lineTo(right - radius, top)
      ctx.quadraticCurveTo(right, top, right, top + radius)
      ctx.lineTo(right, bottom - radius)
      ctx.quadraticCurveTo(right, bottom, right - radius, bottom)
      ctx.lineTo(left + radius, bottom)
      ctx.quadraticCurveTo(left, bottom, left, bottom - radius)
      ctx.closePath()
      ctx.fill()
    },
    drawGridNumber (ctx, grid) {
      let {val, rect} = grid
      let {backgroundColor, color, fontSize} = this.getNumberStyle(val)

      this.drawRoundingRect({ctx, rect, fillStyle: backgroundColor})
      fontSize = fontSize * this.canvasRealSize.RATIO
      // draw text
      ctx.fillStyle = color
      ctx.font = `bold ${fontSize}px Microsoft YaHei`
      let text = ctx.measureText(val)
      let x = rect.left + (rect.right - rect.left) / 2 - text.width / 2
      let y = rect.bottom - (rect.bottom - rect.top) / 2 + fontSize / 3
      ctx.fillText(grid.val, x, y)
    },
    generateGridNumber (ctx) {
      let count = 0
      let maxCount = 100
      let generate = (row, col) => {
        let val = Math.ceil(Math.random() * 2) * 2
        this.grids[row][col] = {
          rect: this.getBoundingClientRect(row, col),
          val
        }
        this.drawGridNumber(ctx, this.grids[row][col])

        this.$emit('changescore', val)
      }
      while (count < maxCount) {
        let row = Math.floor(Math.random() * ROW)
        let col = Math.floor(Math.random() * COL)
        if (this.grids[row][col] === null) {
          generate(row, col)
          break
        }
        count++
      }
      if (count === maxCount) {
        for (let i = 0; i < ROW; i++) {
          for (let j = 0; j < COL; j++) {
            if (this.grids[i][j] === null) {
              generate(i, j)
              break
            }
          }
        }
      }
    },
    getBoundingClientRect (row, col) {
      let {BORDER_WIDTH, CELL_WIDTH} = this.canvasRealSize
      let left = (row + 1) * BORDER_WIDTH + CELL_WIDTH * row
      let top = (col + 1) * BORDER_WIDTH + CELL_WIDTH * col
      return {
        left,
        top,
        right: left + CELL_WIDTH,
        bottom: top + CELL_WIDTH,
        height: CELL_WIDTH,
        width: CELL_WIDTH
      }
    },
    getNumberStyle (number) {
      let backgroundColor = 'black'
      let color = 'white'
      let fontSize:number = 46
      switch (number) {
        case 2:
          backgroundColor = '#eee4da'
          color = '#776e50'
          break
        case 4:
          backgroundColor = '#ede0c8'
          color = '#776e50'
          break
        case 8:
          backgroundColor = '#f2b179'
          break
        case 16:
          backgroundColor = '#f59563'
          break
        case 32:
          backgroundColor = '#f67c5f'
          break
        case 64:
          backgroundColor = '#f65e3b'
          break
        case 128:
          backgroundColor = '#edcf72'
          fontSize = 32
          break
        case 256:
          backgroundColor = '#edcc61'
          fontSize = 32
          break
        case 512:
          backgroundColor = '#9c0'
          fontSize = 32
          break
        case 1024:
          backgroundColor = '#33b5e5'
          fontSize = 20
          break
        case 2048:
          backgroundColor = '#09c'
          fontSize = 20
          break
      }
      return {
        backgroundColor,
        color,
        fontSize
      }
    },
    nospace () {
      for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
          if (this.grids[i][j] === null) {
            return false
          }
        }
      }
      return true
    },
    nomoving () {
      for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
          let grid = this.grids[i][j]
          if ((i + 1) < ROW && grid.val === this.grids[i + 1][j].val) {
            return false
          }
          if ((j + 1) < COL && grid.val === this.grids[i][j + 1].val) {
            return false
          }
        }
      }
      return true
    },
    eventListenerSwitch (sw:string = 'on') {
      this.$nextTick(() => {
        let canvas = this.$refs.tiles
        if (sw === 'on') {
          canvas.addEventListener('touchstart', this.listener.touchstart, false)
          canvas.addEventListener('touchend', this.listener.touchend, false)
          document.addEventListener('keydown', this.listener.keydown, false)
        } else {
          canvas.removeEventListener('touchstart', this.listener.touchstart, false)
          canvas.removeEventListener('touchend', this.listener.touchend, false)
          document.removeEventListener('keydown', this.listener.keydown, false)
        }
      })
    },
    moving (direction) {
      let {REAL_WIDTH} = this.canvasRealSize
      let ctx = this.$refs.tiles.getContext('2d')

      this.moveable = false
      if (direction === 'RIGHT') {
        this.moveRight()
      } else if (direction === 'LEFT') {
        this.moveLeft()
      } else if (direction === 'UP') {
        this.moveUp()
      } else {
        this.moveDown()
      }

      if (this.moveable) {
        ctx.clearRect(0, 0, REAL_WIDTH, REAL_WIDTH)
        for (let i = 0; i < ROW; i++) {
          for (let j = 0; j < COL; j++) {
            if (this.grids[i][j]) {
              this.drawGridNumber(ctx, this.grids[i][j])
            }
          }
        }
        setTimeout(() => {
          this.generateGridNumber(ctx)
        }, 200)
      }
      if (this.moveable === false) {
        if (this.nospace() && this.nomoving()) {
          this.drawGameover(ctx)
        }
      }
    },

    moveLeft () {
      for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
          let currentTile = this.grids[i][j]
          let i1 = i + 1
          while (i1 < ROW) {
            let mergeTile = this.mergeTile({currentTile, row: i, col: j}, {i: i1, j})
            if (mergeTile === true) {
              break
            } else {
              currentTile = mergeTile
              i1++
            }
          }
        }
      }
    },
    moveRight () {
      for (let i = ROW - 1; i >= 0; i--) {
        for (let j = 0; j < COL; j++) {
          let currentTile = this.grids[i][j]
          let i1 = i - 1
          while (i1 >= 0) {
            let mergeTile = this.mergeTile({currentTile, row: i, col: j}, {i: i1, j})
            if (mergeTile === true) {
              break
            } else {
              currentTile = mergeTile
              i1--
            }
          }
        }
      }
    },
    moveUp () {
      for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
          let currentTile = this.grids[i][j]
          let j1 = j + 1
          while (j1 < COL) {
            let mergeTile = this.mergeTile({currentTile, row: i, col: j}, {i, j: j1})
            if (mergeTile === true) {
              break
            } else {
              currentTile = mergeTile
              j1++
            }
          }
        }
      }
    },
    moveDown () {
      for (let i = 0; i < ROW; i++) {
        for (let j = COL - 1; j >= 0; j--) {
          let currentTile = this.grids[i][j]
          let j1 = j - 1
          while (j1 >= 0) {
            let mergeTile = this.mergeTile({currentTile, row: i, col: j}, {i, j: j1})
            if (mergeTile === true) {
              break
            } else {
              currentTile = mergeTile
              j1--
            }
          }
        }
      }
    },
    mergeTile (current, neighbor) {
      let {currentTile, row, col} = current
      let {i, j} = neighbor
      let isMerge = false
      if (currentTile) {
        if (this.grids[i][j]) {
          if (this.grids[i][j].val === currentTile.val) {
            currentTile.val = currentTile.val * 2
            this.grids[i][j] = null
            this.moveable = true
          }
          isMerge = true
        }
      } else if (this.grids[i][j]) {
        this.moveable = true
        currentTile = this.grids[i][j]
        this.grids[i][j] = null
      }
      if (currentTile) {
        this.grids[row][col] = {
          val: currentTile.val,
          rect: this.getBoundingClientRect(row, col)
        }
      }
      if (isMerge) {
        return true
      }
      return currentTile
    },
    initCanvasSize () {
      this.$nextTick(() => {
        let tiles = this.$refs.tiles
        let chessBoard = this.$refs.chessBoard

        let width = tiles.width
        let RATIO = (():number => {
          let ctx = tiles.getContext('2d')
          let dpr = window.devicePixelRatio || 1
          let bsr = ctx.webkitBackingStorePixelRatio ||
                    ctx.mozBackingStorePixelRatio ||
                    ctx.msBackingStorePixelRatio ||
                    ctx.oBackingStorePixelRatio ||
                    ctx.backingStorePixelRatio || 1
          return dpr / bsr
        })()
        let REAL_WIDTH = width * RATIO
        let BORDER_WIDTH = REAL_WIDTH / 5 / 5
        let CELL_WIDTH = REAL_WIDTH / 5

        // 初始化$tiles的大小
        tiles.width = REAL_WIDTH
        tiles.height = REAL_WIDTH
        tiles.style.width = width + 'px'
        tiles.style.height = width + 'px'

        // 初始化$chessBoard的大小
        chessBoard.width = REAL_WIDTH
        chessBoard.height = REAL_WIDTH
        chessBoard.style.width = width + 'px'
        chessBoard.style.height = width + 'px'

        this.canvasRealSize = {
          REAL_WIDTH,
          BORDER_WIDTH,
          CELL_WIDTH,
          RATIO
        }
      })
    }
  },
  mounted () {
    this.initCanvasSize()
    this.initChessBoard()
    this.$on('movingtiles', this.moving)

    // 开始游戏
    this.start()
  }
})

export default components;

</script>
<style lang="less">
.Custom2048 {
    canvas {
        position: absolute;
        top: 120px;
        left: 50%;
        transform: translateX(-50%);
        display: block;
        border-radius: 6px;
    }
}
</style>

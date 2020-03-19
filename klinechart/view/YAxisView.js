import AxisView from './AxisView'
import { YAxisPosition, YAxisTextPosition } from '../data/options/styleOptions'
import { getFont } from '../utils/canvas'
import { formatBigNumber } from '../utils/format'

export default class YAxisView extends AxisView {
  _draw () {
    super._draw()
    this._drawLastPriceLabel()
  }

  _drawAxisLine () {
    const yAxis = this._chartData.styleOptions().yAxis
    if (!yAxis.display || !yAxis.line.display) {
      return
    }
    this._ctx.strokeStyle = yAxis.line.color
    this._ctx.lineWidth = yAxis.line.size
    this._ctx.beginPath()
    if (
      (yAxis.position === YAxisPosition.LEFT && yAxis.tick.text.position === YAxisTextPosition.INSIDE) ||
      (yAxis.position === YAxisPosition.RIGHT && yAxis.tick.text.position === YAxisTextPosition.OUTSIDE)
    ) {
      this._ctx.moveTo(0, 0)
      this._ctx.lineTo(0, this._height)
    } else {
      this._ctx.moveTo(this._width, 0)
      this._ctx.lineTo(this._width, this._height)
    }
    this._ctx.stroke()
    this._ctx.closePath()
  }

  _drawTickLines () {
    const yAxis = this._chartData.styleOptions().yAxis
    const tickText = yAxis.tick.text
    if (!yAxis.display || !tickText.display) {
      return
    }
    const tickLine = yAxis.tick.line
    this._ctx.lineWidth = tickLine.size
    this._ctx.strokeStyle = tickLine.color

    const tickLineLength = tickLine.length

    let startX
    let endX
    const tickTextPosition = tickText.position
    if (
      (yAxis.position === YAxisPosition.LEFT && tickTextPosition === YAxisTextPosition.INSIDE) ||
      (yAxis.position === YAxisPosition.RIGHT && tickTextPosition === YAxisTextPosition.OUTSIDE)
    ) {
      startX = 0
      if (yAxis.line.display) {
        startX += yAxis.line.size
      }
      endX = startX + tickLineLength
    } else {
      startX = this._width
      if (yAxis.line.display) {
        startX -= yAxis.line.size
      }
      endX = startX - tickLineLength
    }
    this._axis.ticks().forEach(tick => {
      const y = tick.y
      this._ctx.beginPath()
      this._ctx.moveTo(startX, y)
      this._ctx.lineTo(endX, y)
      this._ctx.stroke()
      this._ctx.closePath()
    })
  }

  _drawTickLabels () {
    const yAxis = this._chartData.styleOptions().yAxis
    const tickText = yAxis.tick.text
    if (!yAxis.display || !tickText.display) {
      return
    }
    const tickLine = yAxis.tick.line
    const tickTextPosition = tickText.position
    const tickLineDisplay = tickLine.display
    const tickLineLength = tickLine.length
    const tickTextMargin = tickText.margin
    let labelX
    if (
      (yAxis.position === YAxisPosition.LEFT && tickTextPosition === YAxisTextPosition.INSIDE) ||
      (yAxis.position === YAxisPosition.RIGHT && tickTextPosition === YAxisTextPosition.OUTSIDE)
    ) {
      labelX = tickTextMargin
      if (yAxis.line.display) {
        labelX += yAxis.line.size
      }
      if (tickLineDisplay) {
        labelX += tickLineLength
      }
      this._ctx.textAlign = 'left'
    } else {
      labelX = this.width - tickTextMargin
      if (yAxis.line.display) {
        labelX -= yAxis.line.size
      }
      if (tickLineDisplay) {
        labelX -= tickLineLength
      }
      this._ctx.textAlign = 'right'
    }
    const textSize = tickText.size
    this._ctx.textBaseline = 'middle'
    this._ctx.font = getFont(textSize)
    this._ctx.fillStyle = tickText.color
    this._axis.ticks().forEach(tick => {
      const text = formatBigNumber(tick.v)
      this._ctx.fillText(text, labelX, tick.y)
    })
    this._ctx.textAlign = 'left'
  }

  /**
   * 绘制最新价文字
   * @private
   */
  _drawLastPriceLabel () {
  }
}

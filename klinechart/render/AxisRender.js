import Render from './Render'
import { nice, getIntervalPrecision, round } from '../utils/number'

class AxisRender extends Render {
  constructor (handler, storage) {
    super(handler, storage)
    this.axisMaximum = 0
    this.axisMinimum = 0
    this.axisRange = 0
    this.ticks = []
  }

  /**
   * 计算轴上的值
   */
  computeAxisTicks () {
    if (this.axisRange < 0) {
      this.ticks = []
      return
    }
    const interval = +nice(this.axisRange / 8.0)
    const precision = getIntervalPrecision(interval)
    const first = +round(Math.ceil(this.axisMinimum / interval) * interval, precision)
    const last = +round(Math.floor(this.axisMaximum / interval) * interval, precision)
    let n = 0
    let f = first

    if (interval !== 0) {
      while (f <= (+last)) {
        ++n
        f += interval
      }
    }
    this.ticks = []
    f = first
    for (let i = 0; i < n; i++) {
      this.ticks[i] = { v: +(f.toFixed(precision)) }
      f += interval
    }
  }
}

export default AxisRender

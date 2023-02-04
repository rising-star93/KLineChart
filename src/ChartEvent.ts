/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Nullable from './common/Nullable'
import SyntheticEvent, { EventHandler, MouseTouchEvent, TOUCH_MIN_RADIUS } from './common/SyntheticEvent'
import Bounding from './common/Bounding'
import Coordinate from './common/Coordinate'
import { UpdateLevel } from './common/Updater'

import { AxisExtremum } from './component/Axis'
import YAxis from './component/YAxis'

import Chart from './Chart'
import Pane, { PaneIdConstants } from './pane/Pane'
import Widget from './widget/Widget'

interface EventTriggerWidgetInfo {
  pane: Nullable<Pane>
  widget: Nullable<Widget>
}

export default class ChartEvent implements EventHandler {
  private readonly _container: HTMLElement
  private readonly _chart: Chart
  private readonly _event: SyntheticEvent

  // 惯性滚动开始时间
  private _flingStartTime = new Date().getTime()
  // 惯性滚动定时器
  private _flingScrollTimerId: Nullable<number> = null
  // 开始滚动时坐标点
  private _startScrollCoordinate: Nullable<Coordinate> = null
  // 开始触摸时坐标
  private _touchCoordinate: Nullable<Coordinate> = null
  // 是否是取消了十字光标
  private _touchCancelCrosshair = false
  // 是否缩放过
  private _touchZoomed = false
  // 用来记录捏合缩放的尺寸
  private _pinchScale = 1

  private _mouseDownWidget: Nullable<Widget> = null

  private _prevYAxisExtremum: Nullable<AxisExtremum> = null

  private _xAxisStartScaleCoordinate: Nullable<Coordinate> = null
  private _xAxisStartScaleDistance = 0
  private _xAxisScale = 1

  private _yAxisStartScaleDistance = 0

  private readonly _boundKeyBoardDownEvent: ((event: KeyboardEvent) => void) = (event: KeyboardEvent) => {
    if (event.shiftKey) {
      switch (event.code) {
        case 'Equal': {
          this._chart.getChartStore().getTimeScaleStore().zoom(0.5)
          break
        }
        case 'Minus': {
          this._chart.getChartStore().getTimeScaleStore().zoom(-0.5)
          break
        }
        case 'ArrowLeft': {
          const timeScaleStore = this._chart.getChartStore().getTimeScaleStore()
          timeScaleStore.startScroll()
          timeScaleStore.scroll(-3 * timeScaleStore.getBarSpace().bar)
          break
        }
        case 'ArrowRight': {
          const timeScaleStore = this._chart.getChartStore().getTimeScaleStore()
          timeScaleStore.startScroll()
          timeScaleStore.scroll(3 * timeScaleStore.getBarSpace().bar)
          break
        }
        default: {
          break
        }
      }
    }
  }

  constructor (container: HTMLElement, chart: Chart) {
    this._container = container
    this._chart = chart
    this._event = new SyntheticEvent(container, this, {
      treatVertDragAsPageScroll: () => false,
      treatHorzDragAsPageScroll: () => false
    })
    container.addEventListener('keydown', this._boundKeyBoardDownEvent)
  }

  pinchStartEvent (): boolean {
    this._touchZoomed = true
    this._pinchScale = 1
    return true
  }

  pinchEvent (event: MouseTouchEvent, scale: number): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (pane?.getId() !== PaneIdConstants.XAXIS && widget?.getName() === 'main') {
      const zoomScale = (scale - this._pinchScale) * 5
      this._pinchScale = scale
      this._chart.getChartStore().getTimeScaleStore().zoom(zoomScale, { x: event.x, y: event.y })
      return true
    }
    return false
  }

  mouseWheelHorizontalEvent (event: MouseTouchEvent, distance: number): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (pane?.getId() !== PaneIdConstants.XAXIS && widget?.getName() === 'main') {
      const timeScaleStore = this._chart.getChartStore().getTimeScaleStore()
      timeScaleStore.startScroll()
      timeScaleStore.scroll(distance)
      return true
    }
    return false
  }

  mouseWheelVerticalEvent (event: MouseTouchEvent, scale: number): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (pane?.getId() !== PaneIdConstants.XAXIS && widget?.getName() === 'main') {
      this._chart.getChartStore().getTimeScaleStore().zoom(scale, { x: event.x, y: event.y })
      return true
    }
    return false
  }

  mouseDownEvent (event: MouseTouchEvent): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (widget !== null) {
      const name = widget.getName()
      switch (name) {
        case 'separator': {
          this._mouseDownWidget = widget
          return widget.dispatchEvent('mouseDownEvent', event)
        }
        case 'main': {
          const extremum = pane?.getAxisComponent().getExtremum() ?? null
          this._prevYAxisExtremum = extremum === null ? extremum : { ...extremum }
          this._startScrollCoordinate = { x: event.x, y: event.y }
          this._chart.getChartStore().getTimeScaleStore().startScroll()
          return widget.dispatchEvent('mouseDownEvent', event)
        }
        case 'xAxis': {
          this._mouseDownWidget = widget
          const consumed = widget.dispatchEvent('mouseDownEvent', event)
          if (consumed) {
            this._chart.updatePane(UpdateLevel.OVERLAY)
          }
          this._xAxisStartScaleCoordinate = { x: event.x, y: event.y }
          this._xAxisStartScaleDistance = event.pageX
          return consumed
        }
        case 'yAxis': {
          this._mouseDownWidget = widget
          const consumed = widget.dispatchEvent('mouseDownEvent', event)
          if (consumed) {
            this._chart.updatePane(UpdateLevel.OVERLAY)
          }
          const extremum = pane?.getAxisComponent().getExtremum() ?? null
          this._prevYAxisExtremum = extremum === null ? extremum : { ...extremum }
          this._yAxisStartScaleDistance = event.pageY
          return consumed
        }
      }
    }
    return false
  }

  mouseMoveEvent (event: MouseTouchEvent): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (widget !== null) {
      const name = widget.getName()
      switch (name) {
        case 'main': {
          if (this._mouseDownWidget?.getName() === 'main') {
            this._chart.getChartStore().getCrosshairStore().set({ x: event.x, y: event.y, paneId: pane?.getId() })
          }
          return widget.dispatchEvent('mouseMoveEvent', event)
        }
        case 'separator':
        case 'xAxis':
        case 'yAxis': {
          const consumed = widget.dispatchEvent('mouseMoveEvent', event)
          this._chart.getChartStore().getCrosshairStore().set()
          return consumed
        }
      }
    }
    return false
  }

  pressedMouseMoveEvent (event: MouseTouchEvent): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (widget !== null) {
      const name = widget.getName()
      switch (name) {
        case 'main': {
          const bounding = widget.getBounding()
          const consumed = widget.dispatchEvent('pressedMouseMoveEvent', event)
          if (!consumed) {
            if (this._startScrollCoordinate !== null) {
              const yAxis = pane?.getAxisComponent() as YAxis
              if (this._prevYAxisExtremum !== null && !yAxis.getAutoCalcTickFlag()) {
                const { min, max, range } = this._prevYAxisExtremum
                let distance: number
                if (yAxis?.isReverse() ?? false) {
                  distance = this._startScrollCoordinate.y - event.y
                } else {
                  distance = event.y - this._startScrollCoordinate.y
                }
                const scale = distance / bounding.height
                const difRange = range * scale
                const newMin = min + difRange
                const newMax = max + difRange
                const newRealMin = yAxis.convertToRealValue(newMin)
                const newRealMax = yAxis.convertToRealValue(newMax)
                yAxis.setExtremum({
                  min: newMin,
                  max: newMax,
                  range: newMax - newMin,
                  realMin: newRealMin,
                  realMax: newRealMax,
                  realRange: newRealMax - newRealMin
                })
              }
              const distance = event.x - this._startScrollCoordinate.x
              this._chart.getChartStore().getTimeScaleStore().scroll(distance)
            }
          }
          // if (realEvent.x > 0 && realEvent.x < bounding.width && realEvent.y > 0 && realEvent.y < bounding.height) {
          //   crosshairStore.set({ x: event.x, y: event.y, paneId: pane?.getId() })
          // }
          return consumed
        }
        case 'xAxis': {
          const consumed = widget.dispatchEvent('pressedMouseMoveEvent', event)
          if (!consumed) {
            const scale = this._xAxisStartScaleDistance / event.pageX
            const zoomScale = (scale - this._xAxisScale) * 10
            this._xAxisScale = scale
            this._chart.getChartStore().getTimeScaleStore().zoom(zoomScale, this._xAxisStartScaleCoordinate ?? undefined)
          } else {
            this._chart.updatePane(UpdateLevel.OVERLAY)
          }
          return consumed
        }
        case 'yAxis': {
          const consumed = widget.dispatchEvent('pressedMouseMoveEvent', event)
          if (!consumed) {
            if (this._prevYAxisExtremum !== null) {
              const { min, max, range } = this._prevYAxisExtremum
              const scale = event.pageY / this._yAxisStartScaleDistance
              const newRange = range * scale
              const difRange = (newRange - range) / 2
              const newMin = min - difRange
              const newMax = max + difRange
              const yAxis = pane?.getAxisComponent() as YAxis
              const newRealMin = yAxis.convertToRealValue(newMin)
              const newRealMax = yAxis.convertToRealValue(newMax)
              yAxis.setExtremum({
                min: newMin,
                max: newMax,
                range: newRange,
                realMin: newRealMin,
                realMax: newRealMax,
                realRange: newRealMax - newRealMin
              })
              this._chart.adjustPaneViewport(false, true, true, true)
            }
          } else {
            this._chart.updatePane(UpdateLevel.OVERLAY)
          }
          return consumed
        }
      }
    }
    return false
  }

  mouseUpEvent (event: MouseTouchEvent): boolean {
    const { widget } = this._findWidgetByEvent(event)
    let consumed: boolean = false
    if (widget !== null) {
      const name = widget.getName()
      switch (name) {
        case 'main':
        case 'xAxis':
        case 'yAxis': {
          consumed = widget.dispatchEvent('mouseUpEvent', event)
          break
        }
      }
      if (consumed) {
        this._chart.updatePane(UpdateLevel.OVERLAY)
      }
    }
    this._mouseDownWidget = null
    this._startScrollCoordinate = null
    this._prevYAxisExtremum = null
    this._xAxisStartScaleCoordinate = null
    this._xAxisStartScaleDistance = 0
    this._xAxisScale = 1
    this._yAxisStartScaleDistance = 0
    return consumed
  }

  mouseRightClickEvent (event: MouseTouchEvent): boolean {
    const { widget } = this._findWidgetByEvent(event)
    let consumed: boolean = false
    if (widget !== null) {
      const name = widget.getName()
      switch (name) {
        case 'main':
        case 'xAxis':
        case 'yAxis': {
          consumed = widget.dispatchEvent('mouseRightClickEvent', event)
          break
        }
      }
      if (consumed) {
        this._chart.updatePane(UpdateLevel.OVERLAY)
      }
    }
    return false
  }

  mouseDoubleClickEvent (event: MouseTouchEvent): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (widget !== null && widget.getName() === 'yAxis') {
      const yAxis = pane?.getAxisComponent() as YAxis
      if (!yAxis.getAutoCalcTickFlag()) {
        yAxis.setAutoCalcTickFlag(true)
        this._chart.adjustPaneViewport(false, true, true, true)
        return true
      }
    }
    return false
  }

  mouseLeaveEvent (event: MouseTouchEvent): boolean {
    this._chart.getChartStore().getCrosshairStore().set()
    return true
  }

  touchStartEvent (event: MouseTouchEvent): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (widget !== null) {
      const name = widget.getName()
      switch (name) {
        case 'main': {
          const chartStore = this._chart.getChartStore()
          const crosshairStore = chartStore.getCrosshairStore()
          if (widget.dispatchEvent('mouseDownEvent', event)) {
            this._touchCancelCrosshair = true
            this._touchCoordinate = null
            crosshairStore.set(undefined, true)
            this._chart.updatePane(UpdateLevel.OVERLAY)
            return true
          }
          if (this._flingScrollTimerId !== null) {
            clearTimeout(this._flingScrollTimerId)
            this._flingScrollTimerId = null
          }
          this._flingStartTime = new Date().getTime()
          this._startScrollCoordinate = { x: event.x, y: event.y }
          chartStore.getTimeScaleStore().startScroll()
          this._touchZoomed = false
          if (this._touchCoordinate !== null) {
            const xDif = event.x - this._touchCoordinate.x
            const yDif = event.y - this._touchCoordinate.y
            const radius = Math.sqrt(xDif * xDif + yDif * yDif)
            if (radius < TOUCH_MIN_RADIUS) {
              this._touchCoordinate = { x: event.x, y: event.y }
              crosshairStore.set({ x: event.x, y: event.y, paneId: pane?.getId() })
            } else {
              this._touchCancelCrosshair = true
              this._touchCoordinate = null
              crosshairStore.set()
            }
          } else {
            this._touchCancelCrosshair = false
          }
          return true
        }
        case 'xAxis':
        case 'yAxis': {
          const consumed = widget.dispatchEvent('mouseDownEvent', event)
          if (consumed) {
            this._chart.updatePane(UpdateLevel.OVERLAY)
          }
          return consumed
        }
      }
    }
    return false
  }

  touchMoveEvent (event: MouseTouchEvent): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (widget !== null) {
      const name = widget.getName()
      switch (name) {
        case 'main': {
          if (widget.dispatchEvent('pressedMouseMoveEvent', event)) {
            event.preventDefault?.()
            this._chart.updatePane(UpdateLevel.OVERLAY)
            return true
          }
          const chartStore = this._chart.getChartStore()
          if (this._touchCoordinate !== null) {
            event.preventDefault?.()
            chartStore.getCrosshairStore().set({ x: event.x, y: event.y, paneId: pane?.getId() })
          } else {
            if (
              this._startScrollCoordinate !== null &&
              Math.abs(this._startScrollCoordinate.x - event.x) > this._startScrollCoordinate.y - event.y
            ) {
              const distance = event.x - this._startScrollCoordinate.x
              chartStore.getTimeScaleStore().scroll(distance)
            }
          }
          return true
        }
        case 'xAxis':
        case 'yAxis': {
          const consumed = widget.dispatchEvent('pressedMouseMoveEvent', event)
          if (consumed) {
            event.preventDefault?.()
            this._chart.updatePane(UpdateLevel.OVERLAY)
          }
          return consumed
        }
      }
    }
    return false
  }

  touchEndEvent (event: MouseTouchEvent): boolean {
    const { widget } = this._findWidgetByEvent(event)
    if (widget !== null) {
      const name = widget.getName()
      switch (name) {
        case 'main': {
          widget.dispatchEvent('mouseUpEvent', event)
          if (this._startScrollCoordinate !== null) {
            const time = new Date().getTime() - this._flingStartTime
            const distance = event.x - this._startScrollCoordinate.x
            let v = distance / (time > 0 ? time : 1) * 20
            if (time < 200 && Math.abs(v) > 0) {
              const timeScaleStore = this._chart.getChartStore().getTimeScaleStore()
              const flingScroll: (() => void) = () => {
                this._flingScrollTimerId = setTimeout(() => {
                  timeScaleStore.startScroll()
                  timeScaleStore.scroll(v)
                  v = v * (1 - 0.025)
                  if (Math.abs(v) < 1) {
                    if (this._flingScrollTimerId !== null) {
                      clearTimeout(this._flingScrollTimerId)
                      this._flingScrollTimerId = null
                    }
                  } else {
                    flingScroll()
                  }
                }, 20)
              }
              flingScroll()
            }
          }
          return true
        }
        case 'xAxis':
        case 'yAxis': {
          const consumed = widget.dispatchEvent('mouseUpEvent', event)
          if (consumed) {
            this._chart.updatePane(UpdateLevel.OVERLAY)
          }
        }
      }
    }
    return false
  }

  tapEvent (event: MouseTouchEvent): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (widget !== null && widget.getName() === 'main' && this._touchCoordinate === null && !this._touchCancelCrosshair && !this._touchZoomed) {
      this._touchCoordinate = { x: event.x, y: event.y }
      this._chart.getChartStore().getCrosshairStore().set({ x: event.x, y: event.y, paneId: pane?.getId() })
      return true
    }
    return false
  }

  longTapEvent (event: MouseTouchEvent): boolean {
    const { pane, widget } = this._findWidgetByEvent(event)
    if (widget !== null && widget.getName() === 'main') {
      this._touchCoordinate = { x: event.x, y: event.y }
      this._chart.getChartStore().getCrosshairStore().set({ x: event.x, y: event.y, paneId: pane?.getId() })
      return true
    }
    return false
  }

  private _findWidgetByEvent (event: MouseTouchEvent): EventTriggerWidgetInfo {
    const panes = this._chart.getAllPanes()
    const { x, y } = event
    let pane: Nullable<Pane> = null
    let bounding: Nullable<Bounding> = null
    for (const [, p] of panes) {
      const bounding = p.getBounding()
      if (
        x >= bounding.left && y <= bounding.left + bounding.width &&
        y >= bounding.top && y <= bounding.top + bounding.height
      ) {
        pane = p
      }
    }
    pane = this._chart.getPaneById(PaneIdConstants.XAXIS)
    let widget: Nullable<Widget> = null
    if (pane !== null) {
      const rootBounding = pane.getBounding()
      const separatorWidget = pane.getSeparatorWidget()
      if (separatorWidget !== null) {
        const separatorHeight = this._chart.getStyles().separator.size
        if (
          x >= rootBounding.left && x <= rootBounding.left + rootBounding.width &&
          y >= rootBounding.top && y <= rootBounding.top + separatorHeight
        ) {
          widget = separatorWidget
          bounding = rootBounding
        }
      }
      const mainWidget = pane.getMainWidget()
      const mainBounding = mainWidget.getBounding()
      if (
        x >= mainBounding.left && x <= mainBounding.left + mainBounding.width &&
        y >= mainBounding.top && y <= mainBounding.top + mainBounding.height
      ) {
        widget = mainWidget
        bounding = mainBounding
      }
      const yAxisWidget = pane.getYAxisWidget()
      if (yAxisWidget !== null) {
        const yAxisBounding = yAxisWidget.getBounding()
        if (
          x >= yAxisBounding.left && x <= yAxisBounding.left + yAxisBounding.width &&
          y >= yAxisBounding.top && y <= yAxisBounding.top + yAxisBounding.height
        ) {
          widget = yAxisWidget
          bounding = yAxisBounding
        }
      }
    }
    event.x = x - (bounding?.left ?? 0)
    event.y = y - (bounding?.top ?? 0)
    return { pane, widget }
  }

  destroy (): void {
    this._container.removeEventListener('keydown', this._boundKeyBoardDownEvent)
    this._event.destroy()
  }
}

import EventBase from './EventBase'
import ZoomDragEventHandler from './ZoomDragEventHandler'
import GraphicMarkEventHandler from './GraphicMarkEventHandler'
import { GraphicMarkType } from '../data/ChartData'
import KeyBoardEventHandler from './KeyBoardEventHandler'

export default class ChartEvent {
  constructor (target, chartData, xAxis, yAxis) {
    this._target = target
    this._chartData = chartData
    this._seriesSize = {}
    this._event = new EventBase(this._target, {
      pinchStartEvent: this._pinchStartEvent.bind(this),
      pinchEvent: this._pinchEvent.bind(this),
      mouseUpEvent: this._mouseUpEvent.bind(this),
      mouseClickEvent: this._mouseClickEvent.bind(this),
      mouseDownEvent: this._mouseDownEvent.bind(this),
      mouseLeaveEvent: this._mouseLeaveEvent.bind(this),
      mouseMoveEvent: this._mouseMoveEvent.bind(this),
      mouseWheelEvent: this._mouseWheelEvent.bind(this),
      pressedMouseMoveEvent: this._pressedMouseMoveEvent.bind(this),
      longTapEvent: this._longTapEvent.bind(this)
    }, {
      treatVertTouchDragAsPageScroll: false,
      treatHorzTouchDragAsPageScroll: false
    })
    this._boundKeyBoardDownEvent = this._keyBoardDownEvent.bind(this)
    this._target.addEventListener('keydown', this._boundKeyBoardDownEvent)
    this._zoomDragEventHandler = new ZoomDragEventHandler(chartData)
    this._graphicMarkEventHandler = new GraphicMarkEventHandler(chartData, xAxis, yAxis)
    this._keyBoardEventHandler = new KeyBoardEventHandler(chartData)
  }

  _keyBoardDownEvent (event) {
    this._keyBoardEventHandler.keyBoardDownEvent(event)
  }

  _pinchStartEvent () {
    this._zoomDragEventHandler.pinchStartEvent()
  }

  _pinchEvent (middlePoint, scale) {
    this._zoomDragEventHandler.pinchEvent(middlePoint, scale)
  }

  _mouseUpEvent (event) {
    this._graphicMarkEventHandler.mouseUpEvent(event)
  }

  _mouseLeaveEvent (event) {
    if (this._checkZoomDrag()) {
      this._zoomDragEventHandler.mouseLeaveEvent(event)
    }
  }

  _mouseMoveEvent (event) {
    this._graphicMarkEventHandler.mouseMoveEvent(event)
    if (this._checkZoomDrag()) {
      this._zoomDragEventHandler.mouseMoveEvent(event)
    }
  }

  _mouseWheelEvent (event) {
    if (this._checkZoomDrag()) {
      this._zoomDragEventHandler.mouseWheelEvent(event)
    }
  }

  _mouseClickEvent (event) {
    if (this._checkZoomDrag()) {
      this._zoomDragEventHandler.mouseClickEvent(event)
    }
  }

  _mouseDownEvent (event) {
    this._graphicMarkEventHandler.mouseDownEvent(event)
    if (this._checkZoomDrag()) {
      this._zoomDragEventHandler.mouseDownEvent(event)
    }
  }

  _pressedMouseMoveEvent (event) {
    if (this._checkZoomDrag()) {
      this._zoomDragEventHandler.pressedMouseMoveEvent(event)
    }
  }

  _longTapEvent (event) {
    if (this._checkZoomDrag()) {
      this._zoomDragEventHandler.longTapEvent(event)
    }
  }

  _checkZoomDrag () {
    return !this._chartData.dragGraphicMarkFlag() && this._chartData.graphicMarkType() === GraphicMarkType.NONE
  }

  setSeriesSize (seriesSize) {
    this._zoomDragEventHandler.setSeriesSize(seriesSize)
  }

  destroy () {
    this._event.destroy()
    this._target.removeEventListener('keydown', this._boundKeyBoardDownEvent)
  }
}

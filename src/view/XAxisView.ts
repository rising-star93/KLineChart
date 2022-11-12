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

import Bounding from '../common/Bounding'
import { AxisStyle, Styles } from '../common/Styles'

import { LineAttrs } from '../extension/figure/line'
import { TextAttrs } from '../extension/figure/text'

import { Tick } from '../component/Axis'
import XAxis from '../component/XAxis'

import AxisView from './AxisView'

export default class XAxisView extends AxisView<XAxis> {
  protected getAxisStyles (styles: Styles): AxisStyle {
    return styles.xAxis
  }

  protected createAxisLine (bounding: Bounding): LineAttrs {
    return {
      coordinates: [
        { x: 0, y: 0 },
        { x: bounding.width, y: 0 }
      ]
    }
  }

  protected createTickLines (ticks: Tick[], bounding: Bounding, styles: AxisStyle): LineAttrs[] {
    const tickLineStyles = styles.tickLine
    const axisLineSize = styles.axisLine.size
    return ticks.map(tick => ({
      coordinates: [
        { x: tick.coord, y: 0 },
        { x: tick.coord, y: axisLineSize + tickLineStyles.length }
      ]
    }))
  }

  protected createTickTexts (ticks: Tick[], bounding: Bounding, styles: AxisStyle): TextAttrs[] {
    const tickTickStyles = styles.tickText
    const axisLineSize = styles.axisLine.size
    const tickLineLength = styles.tickLine.length
    return ticks.map(tick => ({
      x: tick.coord,
      y: axisLineSize + tickLineLength + tickTickStyles.marginStart,
      text: tick.text
    }))
  }

  protected getTickTextAlign (): CanvasTextAlign {
    return 'center'
  }

  protected getTickTextBaseline (): CanvasTextBaseline {
    return 'top'
  }
}

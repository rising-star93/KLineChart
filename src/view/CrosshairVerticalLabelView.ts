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

import Coordinate from '../common/Coordinate'
import Bounding from '../common/Bounding'
import Crosshair from '../common/Crosshair'
import { CrosshairStyle, CrosshairDirectionStyle } from '../common/Styles'

import XAxis from '../componentl/XAxis'

import ChartStore from '../store/ChartStore'

import { formatDate } from '../common/utils/format'

import CrosshairHorizontalLabelView from './CrosshairHorizontalLabelView'

export default class CrosshairVerticalLabelView extends CrosshairHorizontalLabelView<XAxis> {
  protected checkPaneId (crosshair: Crosshair): boolean {
    return crosshair.dataIndex === crosshair.realDataIndex
  }

  protected getDirectionStyles (styles: CrosshairStyle): CrosshairDirectionStyle {
    return styles.vertical
  }

  protected getText (crosshair: Crosshair, chartStore: ChartStore, axis: XAxis): string {
    const timestamp = crosshair.kLineData?.timestamp as number
    return formatDate(chartStore.getTimeScaleStore().getDateTimeFormat(), timestamp, 'YYYY-MM-DD hh:mm')
  }

  protected getRectCoordinate (rectWidth: number, rectHeight: number, crosshair: Crosshair, bounding: Required<Bounding>): Coordinate {
    const x = crosshair.realX as number
    let rectX: number
    if (x - rectWidth / 2 < 0) {
      rectX = 0
    } else if (x + rectWidth / 2 > bounding.width) {
      rectX = bounding.width - rectWidth
    } else {
      rectX = x - rectWidth / 2
    }
    return { x: rectX, y: 0 }
  }
}

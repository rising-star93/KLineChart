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

import { OverlayTemplate } from '../../component/Overlay'

import { formatValue } from '../../common/utils/format'

const simpleAnnotation: OverlayTemplate = {
  name: 'simpleAnnotation',
  createPointFigures: ({ overlay, coordinates, defaultStyles }) => {
    const styles = overlay.styles
    const textSize = formatValue(styles, 'text.size', defaultStyles.text.size) as number
    const text = overlay.extendData(overlay) as string
    const textWidth = text.length * textSize
    const startX = coordinates[0].x
    const startY = coordinates[0].y - 6
    const lineEndY = startY - 50
    const arrowEndY = lineEndY - 5
    const textStyles = styles?.text ?? defaultStyles.text
    return [
      {
        type: 'line',
        attrs: { coordinates: [{ x: startX, y: startY }, { x: startX, y: lineEndY }] }
      },
      {
        type: 'polygon',
        attrs: { coordinates: [{ x: startX, y: lineEndY }, { x: startX - 4, y: arrowEndY }, { x: startX + 4, y: arrowEndY }] }
      },
      {
        type: 'rect',
        attrs: { x: startX - textWidth / 2, y: arrowEndY - textSize - 16, width: textWidth, height: textSize + 16 }
      },
      {
        type: 'text',
        attrs: { x: startX, y: arrowEndY - textSize / 2 - 8, text },
        styles: { ...textStyles, align: 'center', baseline: 'middle' }
      }
    ]
  }
}

export default simpleAnnotation

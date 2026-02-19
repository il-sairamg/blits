/*
 * Copyright 2025 Comcast Cable Communications Management, LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import symbols from '../lib/symbols.js'
import { state } from '../router/router.js'
import Settings from '../settings.js'
import { DEFAULT_HOLD_TIMEOUT_MS } from '../constants.js'
import { Log } from '../lib/log.js'
import { getAncestors } from './helpers.js'

let hoveredComponent = null
let hoverChain = []

export default {
  get() {
    return hoveredComponent
  },
  set(component) {
    // early return if component is undefined
    if (component === undefined) return

    // early return if already hovered
    if (component === hoveredComponent) return

    if (hoveredComponent === null) {
      hoverChain = getAncestors([component])
    }

    // unhover currently hovered components
    if (hoveredComponent !== null) {
      if (hoverChain[hoverChain.length - 1] === component.parent) {
        hoverChain.push(component)
      } else {
        const newhoverChain = getAncestors([component])
        let i = hoverChain.length
        while (i--) {
          // don't unhover when part of the new hover chain
          if (newhoverChain.indexOf(hoverChain[i]) > -1) break
          // skip if component is destroyed (lifecycle.state becomes undefined)
          if (hoverChain[i].lifecycle.state !== undefined) {
            hoverChain[i].lifecycle.state = 'unhover'
          }
        }
        hoverChain = newhoverChain
      }
    }

    // ensure that all components in the hover path have hover state
    let i = 0
    while (i < hoverChain.length - 1) {
      // skip if component is destroyed (lifecycle.state becomes undefined)
      if (hoverChain[i].lifecycle.state !== undefined) {
        hoverChain[i].lifecycle.state = 'hover'
      }
      i++
    }

    setHover(component, event)

    // // and finally set focus to the leaf component
    // setFocusTimeout = setTimeout(
    //   () => setFocus(component, event),
    //   this.hold === true ? Settings.get('holdTimeout', DEFAULT_HOLD_TIMEOUT_MS) : 0
    // )
  },
  clear() {
    if (hoveredComponent === null) return
    for (let i = 0; i < hoverChain.length; i++) {
      if (hoverChain[i].lifecycle?.state !== undefined) {
        hoverChain[i].lifecycle.state = 'unhover'
      }
    }
    hoveredComponent = null
    hoverChain = []
  },
}

/**
 * Set the focus to the Component
 * @param {Object} component  - The component fo focus
 * @param {MouseEvent} event - Mouse event
 */
const setHover = (component, event) => {
  Log.info(
    '\nHover chain:\n',
    hoverChain.map((c, index) => '\t'.repeat(index) + '↳ ' + c.componentId).join('\n')
  )

  hoveredComponent = component
  component.lifecycle.state = 'hover'

  // ??
  if (event instanceof KeyboardEvent) {
    const internalEvent = new KeyboardEvent('keydown', event)
    // @ts-ignore - this is an internal event
    internalEvent[symbols.internalEvent] = true
    document.dispatchEvent(internalEvent)
  }
}

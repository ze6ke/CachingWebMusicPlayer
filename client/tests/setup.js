import jsdom from 'jsdom'
const {JSDOM} = jsdom
import React from 'react'

global.document = new JSDOM('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.React = React
global.localStorage = {
    "redux-store": false
}
global.navigator = {userAgent: 'node.js'}

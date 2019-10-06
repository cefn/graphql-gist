const logger = console

import isPlainObject from "lodash/isPlainObject"
import isArray from "lodash/isArray"

function containsTree(superTree, subTree) {
  if (superTree !== subTree) {

    let isContainer = false
    if (isPlainObject(superTree)) {
      isContainer = true
      if (!isPlainObject(subTree)) {
        return false //mismatch - not an object
      }
    }
    else if (isArray(superTree)) {
      isContainer = true
      if (!isArray(subTree)) {
        return false //mismatch - not an array
      }
    }

    if (!isContainer) {
      return false //mismatch - primitive but not strict equal
    }
    else {
      for (const key of Object.keys(subTree)) {
        if (!containsTree(superTree[key], subTree[key])) {
          return false //mismatch - child not contained
        }
      }
    }
  }
  return true //match - no mismatch found
}

export {
  containsTree,
  logger,
}
import PubSub from 'pubsub-js'
import { useEffect, MutableRefObject } from 'react'
import { useDispatch } from 'react-redux'
import { debounce } from 'lodash'

import pubsubConfig from 'src/config/pubsub.config'
import { updateFileDoc } from '../app/reducers/currentFileSlice'
import { updateFileIsChange } from '../app/reducers/recentFilesSlice'
import { getCurrentFile } from '../app/store'
import { EditorRef } from '../components/editor'

/**
 * A hook that will listen codemirror doc change and update doc to redux
 *
 * @param editorRef A ref which refer to a wrapped codemirror instance
 */
export const useDocChange = (editorRef: MutableRefObject<EditorRef>) => {
  const dispatch = useDispatch()
  useEffect(() => {
    const innerUpdateDoc = () => {
      const doc = editorRef.current?.getDoc()
      dispatch(updateFileDoc(doc))
    }
    const debounceUpdate = debounce(innerUpdateDoc, 300)
    const updateDoc = () => {
      const filepath = getCurrentFile()

      // update file change and recorde the doc is change
      // and need update cache before toggle file (or create new editor)
      if (filepath && !window.imarkdown.didModified) {
        dispatch(updateFileIsChange({ filepath, isChange: true }))
        window.imarkdown.didModified = true
      }
      debounceUpdate()
    }

    const token = PubSub.subscribe(
      pubsubConfig.UPDATE_EDITOR_CONTENT,
      updateDoc
    )

    return () => {
      PubSub.unsubscribe(token)
    }
  }, [])
}

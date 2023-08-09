import { Tag, styleTags } from '@lezer/highlight'
import { MarkdownConfig } from '@lezer/markdown'

export const markTags = {
  headingMark: Tag.define(),
  quoteMark: Tag.define(),
  listMark: Tag.define(),
  linkMark: Tag.define(),
  emphasisMark: Tag.define(),
  codeMark: Tag.define(),
  codeText: Tag.define(),
  codeInfo: Tag.define(),
  linkTitle: Tag.define(),
  linkLabel: Tag.define(),
  url: Tag.define(),
  inlineCode: Tag.define(),
  tableDelimiter: Tag.define(),
  tableRow: Tag.define()
}

export const markStylingExtension: MarkdownConfig = {
  props: [
    styleTags({
      HeaderMark: markTags.headingMark,
      QuoteMark: markTags.quoteMark,
      ListMark: markTags.listMark,
      LinkMark: markTags.linkMark,
      EmphasisMark: markTags.emphasisMark,
      CodeMark: markTags.codeMark,
      CodeText: markTags.codeText,
      CodeInfo: markTags.codeInfo,
      LinkTitle: markTags.linkTitle,
      LinkLabel: markTags.linkLabel,
      URL: markTags.url,
      InlineCode: markTags.inlineCode,
      TableDelimiter: markTags.tableDelimiter,
      TableRow: markTags.tableRow
    })
  ]
}

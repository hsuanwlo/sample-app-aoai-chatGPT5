import { cloneDeep } from 'lodash'

import { AskResponse, Citation } from '../../api' // Ensure this path matches the location of your types

import { enumerateCitations, parseAnswer, ParsedAnswer } from './AnswerParser' // Update the path accordingly

const sampleCitations: Citation[] = [
  {
    id: 'doc1',
    filepath: 'file1.pdf',
    part_index: undefined,
    content: '',
    title: null,
    url: null,
    metadata: null,
    chunk_id: null,
    reindex_id: null
  },
  {
    id: 'doc2',
    filepath: 'file1.pdf',
    part_index: undefined,
    content: '',
    title: null,
    url: null,
    metadata: null,
    chunk_id: null,
    reindex_id: null
  },
  {
    id: 'doc3',
    filepath: 'file2.pdf',
    part_index: undefined,
    content: '',
    title: null,
    url: null,
    metadata: null,
    chunk_id: null,
    reindex_id: null
  }
]

const sampleAnswer: AskResponse = {
  answer: 'This is an example answer with citations [doc1] and [doc2].',
  citations: cloneDeep(sampleCitations),
  generated_chart: null
}

const sampleJsonCitation: Citation = {
  id: 'doc1',
  filepath: 'entry.json',
  part_index: undefined,
  content: '{"url": "https://contoso.com/page"}',
  title: 'entry.json',
  url: null,
  metadata: '{"Url": "https://contoso.com/page"}',
  chunk_id: null,
  reindex_id: null
}

const sampleJsonAnswer: AskResponse = {
  answer: 'This answer references a JSON citation [doc1].',
  citations: [cloneDeep(sampleJsonCitation)],
  generated_chart: null
}

describe('enumerateCitations', () => {
  it('assigns unique part_index based on filepath', () => {
    const results = enumerateCitations(cloneDeep(sampleCitations))
    expect(results[0].part_index).toEqual(1)
    expect(results[1].part_index).toEqual(2)
    expect(results[2].part_index).toEqual(1)
  })
})

describe('parseAnswer', () => {
  it('derives a URL for JSON citations using metadata', () => {
    const parsedAnswer = parseAnswer(cloneDeep(sampleJsonAnswer))
    expect(parsedAnswer?.citations[0].url).toEqual('https://contoso.com/page')
  })
})

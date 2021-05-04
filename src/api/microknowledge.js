// TODO: change function name

import { getRequest } from './utils'

export const createPaper = (method, params) => {
  const url = '/api/paper'
  return getRequest(url, method, params)
}

export const createInterpretation = (method, params) => {
  const url = '/api/interpretation/create'
  return getRequest(url, method, params)
}

export const getEvidencePage = (method, params) => {
  const url = '/api/micro-evidence/page/' + params.pindx
  return getRequest(url, method, params)
}

export const getConjecturePage = (method, params) => {
  const url = '/api/micro-conjecture/page/' + params.pindx
  return getRequest(url, method, params)
}

export const getKnowledgePage = (method, params) => {
  const url = `/api/micro-knowledge/page/${params.pindx}`
  return getRequest(url, method, params)
}

// TODO: backend url
export const getSearchResult = (params) => {
  const url = `/api/search/page/${params.pindx}`
  return getRequest(url, 'get', params)
}

export const favorMicroKnowledge = (method, id, type) => {
  // type 取值为 "favor" or "unfavor"
  const url = `/api/micro-knowledge/${id}/${type}`
  return getRequest(url, method)
}

export const likeMicroKnowledge = (method, id) => {
  const url = `/api/micro-knowledge/${id}/like`
  return getRequest(url, method)
}

export const likePaper = (method, id) => {
  const url = `/api/paper/${id}/like`
  return getRequest(url, method)
}

export const collectPaper = (method, id) => {
  const url = `/api/paper/${id}/collect`
  return getRequest(url, method)
}

export const likeInterpretation = (method, id) => {
  const url = `/api/interpretation/${id}/like`
  return getRequest(url, method)
}

export const collectInterpretation = (method, id) => {
  const url = `/api/interpretation/${id}/collect`
  return getRequest(url, method)
}

export const addComment = (method, params) => {
  const url = '/api/comment/create'
  return getRequest(url, method, params)
}

export const deleteComment = (method, params) => {
  const url = '/api/comment/delete'
  return getRequest(url, method, params)
}

export const getMicroknowledgeComments = (method, params) => {
  const url = '/api/comment'
  return getRequest(url, method, params)
}

// TODO:
export const microKnowledgeIdReq = (id, type, method, params) => {
  // type 0: evidence 1: conjecture
  const typeUrl = type === 0 ? 'paper' : 'micro-conjecture'
  const url = `/api/${typeUrl}/${id}`
  return getRequest(url, method, params)
}

export const getPaperList = (pageIndex, params) => {
  const url = `api/paper/page/${parseInt(pageIndex)}`
  return getRequest(url, 'get', params)
}

export const recommend = (params) => {
  const url = 'api/recommend'
  return getRequest(url, 'get', params)
}

export const verifyMicroKnowledge = (id, method, params) => {
  const url = `/api/micro-knowledge/${id}/judge`
  return getRequest(url, method, params)
}

export const getTags = (method, params) => {
  const url = `/api/tags/page/${params.pindx}`
  return getRequest(url, method, params)
}
export const favorKnowledgeList = (params) => {
  const url = `/api/favorites/page/${params.pindex}`
  return getRequest(url, 'get', params)
}

export const favorList = (params) => {
  const url = `/api/favorites/page/${params.pindex}`
  return getRequest(url, 'get', params)
}

export const myPostList = (params) => {
  const url = `/api/post/${params.pindx}`
  return getRequest(url, 'get', params)
}

// TODO: 与后端协商图片传输的路由
export const teditorImg = (params) => {
  const url = `/api/todo/url`
  return getRequest(url, 'post', params)
}

export const getInterpretation = (id, params) => {
  const url = `/api/interpretation/${id}`
  return getRequest(url, 'get', params)
}

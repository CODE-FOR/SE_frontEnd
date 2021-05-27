import { getRequest } from './utils'

export const getChatUserList = () => {
    const url = '/api/chat-user-list'
    return getRequest(url, 'get')
}

export const addUsrToChatList = (params) => {
    const url = '/api/add-usr-into-chat-list'
    return getRequest(url, 'post', params)
}

export const clearUnread = (params) => {
    const url = '/api/clear-unread'
    return getRequest(url, 'post', params)
}

export const getChatUser = (params) => {
    const url = '/api/chat-user'
    return getRequest(url, 'post', params)
}

export const getChatMessages = () => {
    const url = '/api/chat-message-list'
    return getRequest(url, 'get')
}
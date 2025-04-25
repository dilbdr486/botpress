import classnames from 'classnames'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'

import { RootStore, StoreDef } from '../store'

import BotInfo from './common/BotInfo'
import Composer from './Composer'
import ConversationList from './ConversationList'
import Footer from './Footer'
import Header from './Header'
import * as Keyboard from './Keyboard'
import MessageList from './messages/MessageList'
import OverridableComponent from './OverridableComponent'

type TabType = 'chat' | 'home'

interface ContainerState {
  activeTab: TabType
}

class Container extends React.Component<ContainerProps, ContainerState> {
  constructor(props) {
    super(props)
    this.state = { activeTab: 'chat' }
  }

  handleTabClick = (tab: TabType) => {
    this.setState({ activeTab: tab })
  }

  isTabEnabledForBot = () => {
    const allowedBotIds = ['textbot']
    return allowedBotIds.includes(this.props.store?.botId)
  }

  handleRecentChatClick = (conversationId:string) => {
    this.setState({ activeTab: 'chat' })
  }

  renderHomeTab() {
    const messages = this.props.store?.currentConversation?.messages || []
    const botMessages = messages.filter(msg => msg.authorId === null)

  // Get the last bot message
  const lastBotMessage = botMessages[botMessages.length - 1]

  return (
    <div className="bpw-home-section">
      <h4>Recent Chats</h4>
      {lastBotMessage ? (
        <ul className="bpw-recent-chats">
          <li key={lastBotMessage.id}>
            <button onClick={() => this.handleRecentChatClick(lastBotMessage.conversationId)}>
              <strong>Bot:</strong> {lastBotMessage.payload?.text}
            </button>
          </li>
        </ul>
      ) : (
        <p>No recent conversations found.</p>
      )}
    </div>
  )
  }

  renderBody() {
    const { activeTab } = this.state
    const showTabs = this.isTabEnabledForBot()
    const recentChats = this.props.store?.currentConversation?.messages || []

    if (!this.props.isInitialized) {
      return (
        <div className="bpw-msg-list-container bpw-msg-list-container-loading">
          <div className="bpw-msg-list-loading" />
        </div>
      )
    }

    if (this.props.isConversationsDisplayed) {
      return <ConversationList />
    } else if (this.props.isBotInfoDisplayed) {
      return <BotInfo />
    } else {
      return (
        <div
          className={classnames('bpw-msg-list-container', {
            'bpw-emulator': this.props.isEmulator,
            'bpw-rtl': this.props.rtl
          })}
        >
          {!showTabs || activeTab === 'chat' ? (
            <>
              <MessageList />
              <Keyboard.Default>
                <OverridableComponent name={'composer'} original={Composer} />
              </Keyboard.Default>
            </>
          ) : (
            this.renderHomeTab()
          )}
        </div>
      )
    }
  }

  render() {
    const classNames = classnames('bpw-layout', 'bpw-chat-container', {
      'bpw-layout-fullscreen': this.props.isFullscreen && 'fullscreen',
      [`bpw-anim-${this.props.sideTransition}`]: true
    })

    const showTabs = this.isTabEnabledForBot()

    return (
      <React.Fragment>
        <OverridableComponent name={'before_container'} original={null} />
        <div className={classNames} style={{ width: this.props.dimensions.layout }}>
          <Header />
          {this.renderBody()}

          {showTabs && (
            <div className="bpw-tab-buttons" style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
              <button
                onClick={() => this.handleTabClick('home')}
                className={this.state.activeTab === 'home' ? 'active-tab' : ''}
              >
                Home
              </button>
              <button
                onClick={() => this.handleTabClick('chat')}
                className={this.state.activeTab === 'chat' ? 'active-tab' : ''}
              >
                Chat
              </button>
            </div>
          )}

          <OverridableComponent name={'below_conversation'} original={null} />
          {this.props.isPoweredByDisplayed && <Footer />}
        </div>
      </React.Fragment>
    )
  }
}

export default inject(({ store }: { store: RootStore }) => ({
  store,
  isConversationsDisplayed: store.view.isConversationsDisplayed,
  isBotInfoDisplayed: store.view.isBotInfoDisplayed,
  isFullscreen: store.view.isFullscreen,
  sideTransition: store.view.sideTransition,
  dimensions: store.view.dimensions,
  isEmulator: store.isEmulator,
  isInitialized: store.isInitialized,
  isPoweredByDisplayed: store.view.isPoweredByDisplayed,
  config: store.config,
  botName: store.botName,
  botId: store.botId,
  rtl: store.rtl
}))(injectIntl(observer(Container)))

type ContainerProps = { store?: RootStore } & InjectedIntlProps &
  Pick<
    StoreDef,
    | 'config'
    | 'botName'
    | 'botId'
    | 'isFullscreen'
    | 'isConversationsDisplayed'
    | 'isBotInfoDisplayed'
    | 'sideTransition'
    | 'isInitialized'
    | 'dimensions'
    | 'isEmulator'
    | 'isPoweredByDisplayed'
    | 'rtl'
  >

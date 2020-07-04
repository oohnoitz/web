import React from 'react'
import { initializeStore } from '../app/store'
import { Provider } from 'react-redux'
import App, { AppContext } from 'next/app'
import withRedux from 'next-redux-wrapper'
import { Store } from 'redux'
import AppEffects from '../app/AppEffects'
import 'react-vis/dist/style.css'
import Modal from 'react-modal'
import '@app/ui/setup'
import Layout from '@app/ui/components/Layout'
import { parseSessionFromContext } from '@app/session/domain'

class MyApp extends App<{ store: Store }> {
  static async getInitialProps({ Component, ctx }: AppContext) {
    parseSessionFromContext(ctx)

    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {}

    return { pageProps }
  }

  componentDidMount() {
    Modal.setAppElement('#__next')
  }

  render() {
    const { Component, pageProps, store } = this.props

    return (
      <Provider store={store}>
        <AppEffects />
        <Layout overridesLayout={pageProps?.overridesLayout ?? false}>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    )
  }
}

export default withRedux(initializeStore)(MyApp)

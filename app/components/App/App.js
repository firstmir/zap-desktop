import React from 'react'
import PropTypes from 'prop-types'
import Form from 'components/Form'
import ReceiveModal from 'components/Wallet/ReceiveModal'
import ActivityModal from 'containers/Activity/ActivityModal'
import Activity from 'containers/Activity'
import Wallet from 'containers/Wallet'
import { MainContent } from 'components/UI'

// Initial refetch after 2 seconds.
const INITIAL_REFETCH_INTERVAL = 2000

// Fetch node data no less than once every 10 minutes.
const MAX_REFETCH_INTERVAL = 1000 * 60 * 10

// Amount to increment refetch timer by after each fetch.
const BACKOFF_SCHEDULE = 1.5

class App extends React.Component {
  timer = undefined
  nextFetchIn = INITIAL_REFETCH_INTERVAL

  static propTypes = {
    form: PropTypes.object.isRequired,
    formProps: PropTypes.object.isRequired,
    closeForm: PropTypes.func.isRequired,
    currentTicker: PropTypes.object,
    receiveModalProps: PropTypes.object,
    setIsWalletOpen: PropTypes.func.isRequired,
    fetchPeers: PropTypes.func.isRequired,
    fetchDescribeNetwork: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { fetchDescribeNetwork, setIsWalletOpen } = this.props

    // Set wallet open state.
    setIsWalletOpen(true)

    // fetch LN network from nodes POV.
    fetchDescribeNetwork()

    // fetch node info.
    this.fetchData()
  }

  componentWillUnmount() {
    this.clearFetchTimer()
  }

  /**
   * Fetch node data on an exponentially incrementing backoff schedule so that when the app is first mounted, we fetch
   * node data quite frequently but as time goes on the frequency is reduced down to a maximum of MAX_REFETCH_INTERVAL
   */
  fetchData = () => {
    const { fetchPeers } = this.props
    const { nextFetchIn } = this
    const next = Math.round(Math.min(nextFetchIn * BACKOFF_SCHEDULE, MAX_REFETCH_INTERVAL))

    // Fetch information about connected peers.
    fetchPeers()

    // ensure previous timer is cleared if it exists
    this.clearFetchTimer()

    this.timer = setTimeout(this.fetchData, nextFetchIn)

    // Increment the next fetch interval.
    this.nextFetchIn = next
  }

  clearFetchTimer() {
    const { timer } = this
    if (typeof timer !== 'undefined') {
      clearTimeout(timer)
    }
  }

  render() {
    const { currentTicker, form, formProps, closeForm, receiveModalProps } = this.props

    return (
      <>
        {currentTicker && (
          <>
            <ReceiveModal {...receiveModalProps} />
            <ActivityModal />
            <Form formType={form.formType} formProps={formProps} closeForm={closeForm} />
          </>
        )}

        <MainContent>
          <Wallet />
          <Activity />
        </MainContent>
      </>
    )
  }
}

export default App

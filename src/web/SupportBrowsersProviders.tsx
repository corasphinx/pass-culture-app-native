import React from 'react'
// eslint-disable-next-line no-restricted-imports
import {
  browserName,
  browserVersion as browserVersionString,
  isChrome,
  isChromium,
  isSafari,
  isFirefox,
  isEdge,
  isSamsungBrowser,
  isMobileSafari,
} from 'react-device-detect'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'

const browserVersion = Number(browserVersionString)

export const SupportedBrowsersGate: React.FC = ({ children }) => {
  const [shouldDisplayApp, setShouldDisplayApp] = React.useState(() => isBrowserSupported())

  if (!shouldDisplayApp) {
    return <BrowserNotSupportedPage onPress={() => setShouldDisplayApp(true)} />
  }
  return <React.Fragment>{children}</React.Fragment>
}

const supportedBrowsers: Array<{
  name: string
  message: string
  active: boolean
  version: number
}> = [
  { name: 'Chrome', message: 'Chrome', active: isChrome, version: 50 },
  {
    name: 'Chromium',
    message: 'Les navigateurs basés sur Chromium (autre que Chrome)',
    active: isChromium,
    version: 0,
  },
  { name: 'Safari mobile', message: 'Safari sur iOS', active: isMobileSafari, version: 12 },
  { name: 'Safari', message: 'Safari sur macOS', active: isSafari, version: 10 },
  { name: 'Firefox', message: 'Firefox', active: isFirefox, version: 55 },
  { name: 'Edge', message: 'Edge sur Windows', active: isEdge, version: 79 },
  { name: 'Samsung', message: 'Samsung', active: isSamsungBrowser, version: 5 },
]

function isBrowserSupported() {
  const notSupported = supportedBrowsers.some(
    ({ active, version }) => active && version > browserVersion
  )
  if (notSupported) return false
  return true
}

export const BrowserNotSupportedPage: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <View style={styles.page}>
      <View style={styles.content}>
        <Text
          style={
            styles.title
          }>{`Nous ne supportons pas officiellement ton navigateur : ${browserName} version ${browserVersion}`}</Text>
        <Text style={styles.text}>{'Nous te conseillons de mettre à jours ton navigateur.'}</Text>
        <Text style={styles.text}>{'Les navigateurs supportés sont les suivants :'}</Text>
        <View style={styles.list}>
          {supportedBrowsers.map(({ name, message, version }) => {
            let displayedMessage = `- ${message}`
            if (version > 0) {
              displayedMessage += ` (version > ${version})`
            }
            return (
              <Text key={name} style={[styles.text, styles.listItemText]}>
                {displayedMessage}
              </Text>
            )
          })}
        </View>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>
            {"Je m'en fiche, je veux quand même accéder à l'app"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flexDirection: 'column', alignItems: 'center', padding: 10 },
  list: { flexDirection: 'column' },
  listItemText: { paddingBottom: 6, textAlign: 'left' },
  title: { fontSize: 24, paddingBottom: 16, textAlign: 'center' },
  text: { fontSize: 15, paddingBottom: 8, textAlign: 'center' },
  // eslint-disable-next-line react-native/no-color-literals
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    marginTop: 20,
    padding: 10,
    color: 'white',
    backgroundColor: '#eb0055',
    height: 50,
  },
  // eslint-disable-next-line react-native/no-color-literals
  buttonText: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
  },
})

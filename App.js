import React, { Component } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import {
  Button,
  TextInput,
  View,
  AsyncStorage,
  StyleSheet,
  Dimensions
} from 'react-native'
import NavigationBar from 'react-native-navbar'
import io from 'socket.io-client'

console.disableYellowBox = true
const fullWidth = Dimensions.get('window').width

export default class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      messages: [],
      user: {
        _id: undefined,
        name: undefined
      },
      requestUserName: false
    }

    this.client = io('http://192.168.1.10:8080', {transports: ['websocket']})
    this.onSend = this.onSend.bind(this)
    this.client.on('message', data => this.receiveMessage(data))
    this.componentWillUnmount = this.componentWillUnmount.bind(this)
    this.setupUser = this.setupUser.bind(this)
    this.resetUser = this.resetUser.bind(this)
    AsyncStorage.getItem('userName').then(name => {
      this.setState(before => {
        return {user: {
          _id: undefined,
          name
        }}
      })
      this.setupUser()
    }).catch(e => console.log(e))
  }

  componentWillUnmount () {
    this.client.off('message')
  }

  onSend (messages = []) {
    messages.forEach(msg => this.client.emit('message', msg))
  }

  receiveMessage (message) {
    this.setState(before => {
      return {
        messages: GiftedChat.append(before.messages, [message])
      }
    })
  }

  resetUser () {
    this.setState({
      requestUserName: true,
      user: {
        _id: undefined,
        name: undefined
      }
    })
  }

  async setupUser () {
    if (this.state.user.name) {
      try {
        await AsyncStorage.setItem('userName', this.state.user.name)
        this.client.emit('user', this.state.user.name, data => {
          this.setState({
            user: data.user,
            messages: data.messages
          })
        })
        this.setState({requestUserName: false})
      } catch (e) {
        console.log(e)
      }
    } else {
      this.setState({requestUserName: true})
    }
  }

  render () {
    if (this.state.requestUserName) {
      return (
        <View style={styles.container}>
          <TextInput
            style={styles.nameInput}
            placeholder='名前を入力してください！'
            onChangeText={(name) => this.setState({user: {
              _id: undefined,
              name
            }})}
          />
          <Button
            onPress={this.setupUser}
            title='ユーザー登録'
            color='#2980b9'
          />
        </View>
      )
    } else {
      return (
        <View style={{flex: 1}}>
          <NavigationBar
            title={{title: 'Realtime Chat'}}
            rightButton={{
              title: 'Reset',
              handler: this.resetUser
            }}
           />
          <GiftedChat
            messages={this.state.messages}
            onSend={this.onSend}
            user={this.state.user}
          />
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  nameInput: {
    borderWidth: 1,
    height: 40,
    width: fullWidth - 20
  }
})


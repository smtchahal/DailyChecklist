import React from 'react';
import {
  Alert,
  Button,
  CheckBox,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  AsyncStorage,
} from 'react-native';

const Item = ({ checked, onValueChange, value, onLongPress }) => (
  <View style={{ flexDirection: 'row' }}>
    <CheckBox value={checked} onValueChange={onValueChange} />
    <Text style={styles.itemText} onLongPress={onLongPress}>
      {value}
    </Text>
  </View>
);

export default class App extends React.Component {
  state = {
    items: [],
    newItemText: '',
    editItemText: '',
    editItemIndex: null,
    confirmEditModalVisible: false,
  };

  async componentDidMount() {
    try {
      const itemsRaw = await AsyncStorage.getItem('items');
      console.log('raw items is', itemsRaw);
      if (itemsRaw) {
        items = JSON.parse(itemsRaw);
        if (Array.isArray(items)) {
          this.setState({ items });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  persistItems = async () => {
    console.log('persistItems says items to save are', this.state.items);
    try {
      await AsyncStorage.setItem(
        'items',
        JSON.stringify(
          this.state.items.map(item => ({ ...item, checked: false })),
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  checkItem = index => {
    this.setState(({ items }) => ({
      items: items.map((item, currentIndex) => {
        if (index === currentIndex) {
          return { ...item, checked: !item.checked };
        }
        return item;
      }),
    }));
  };

  addItem = value => {
    console.log(`addItem: ${value}`);
    this.setState(
      ({ items }) => ({
        items: [...items, { value, checked: false }],
      }),
      () => this.persistItems(),
    );
  };

  handleNewItemTextChange = newItemText => {
    this.setState({ newItemText });
  };

  handleAddButtonPress = e => {
    const newItemText = this.state.newItemText.trim();
    if (newItemText) {
      this.addItem(newItemText);
      this.setState({ newItemText: '' });
    }
  };

  handleEditItemTextChange = editItemText => {
    this.setState({ editItemText });
  };

  handleEditButtonPress = () => {
    this.editItem(this.state.editItemIndex, this.state.editItemText);
    this.setState({ confirmEditModalVisible: false });
  };

  deleteItem = index => {
    console.log('Deleting item of index ', index);
    this.setState(
      ({ items }) => ({
        items: items.filter((item, _index) => index !== _index),
      }),
      () => this.persistItems(),
    );
  };

  confirmDeleteItem = index => {
    console.log('confirming deletion of item of index', index);
    const itemText = this.state.items[index].value;
    Alert.alert(
      null,
      `Are you sure you want to delete item '${itemText}'?`,
      [
        { text: 'Cancel' },
        { text: 'Delete', onPress: () => this.deleteItem(index) },
      ],
      { cancelable: true },
    );
  };

  editItem = (index, value) => {
    this.setState(
      ({ items }) => ({
        items: items.map((item, currentIndex) => {
          if (index === currentIndex) {
            return { ...item, value };
          }
          return item;
        }),
      }),
      () => this.persistItems(),
    );
  };

  confirmEditItem = index => {
    const editItemText = this.state.items[index].value;
    this.setState({
      confirmEditModalVisible: true,
      editItemText,
      editItemIndex: index,
    });
  };

  handleItemLongPress = index => {
    const itemText = this.state.items[index].value;
    Alert.alert(
      itemText,
      'Please select an action.',
      [
        { text: 'Cancel' },
        { text: 'Delete', onPress: () => this.confirmDeleteItem(index) },
        { text: 'Edit', onPress: () => this.confirmEditItem(index) },
      ],
      { cancelable: true },
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.confirmEditModalVisible}
          onRequestClose={() =>
            this.setState({ confirmEditModalVisible: false })
          }
        >
          <View>
            <TextInput
              style={styles.inputText}
              placeholder="Edit item..."
              value={this.state.editItemText}
              onChangeText={this.handleEditItemTextChange}
              onSubmitEditing={this.handleEditButtonPress}
              blurOnSubmit={false}
            />
            <Button
              style={styles.addButton}
              onPress={this.handleEditButtonPress}
              title="Save"
              disabled={!this.state.editItemText.trim()}
            />
          </View>
        </Modal>
        {this.state.items.map(({ checked, value }, index) => (
          <Item
            key={index}
            checked={checked}
            value={value}
            onValueChange={() => this.checkItem(index)}
            onLongPress={() => this.handleItemLongPress(index)}
          />
        ))}
        <TextInput
          style={styles.inputText}
          placeholder="Add new item..."
          value={this.state.newItemText}
          onChangeText={this.handleNewItemTextChange}
          onSubmitEditing={this.handleAddButtonPress}
          blurOnSubmit={false}
        />
        <Button
          style={styles.addButton}
          onPress={this.handleAddButtonPress}
          title="Add"
          disabled={!this.state.newItemText.trim()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight + 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  itemText: {
    marginTop: 'auto',
    flexGrow: 1,
    marginBottom: 'auto',
  },
  addButton: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36,
  },
  inputText: {
    borderColor: '#bcbcbc',
    borderWidth: 1,
    padding: 4,
    marginTop: 10,
    marginBottom: 10,
  },
});

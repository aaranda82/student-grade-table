import React from 'react';
import ItemTable from './itemTable';
import Header from './header';
import ItemForm from './itemForm';
import ListByStore from './listByStore';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsToBuy: [],
      itemToUpdate: {},
      isMobilePortrait: true,
      inputFormFeedback: '',
      view: {
        name: 'shoppingList',
        store: ''
      }
    };
    this.newItem = this.newItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.itemToUpdate = this.itemToUpdate.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.screenSizeCheck = this.screenSizeCheck.bind(this);
    this.setView = this.setView.bind(this);
  }

  async componentDidMount() {
    window.addEventListener('resize', this.screenSizeCheck);
    try {
      const response = await fetch('/api/items');
      const itemsToBuy = await response.json();
      this.setState({ itemsToBuy });
    } catch (error) {
      console.error(error);
    }
    this.screenSizeCheck();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.screenSizeCheck);
  }

  screenSizeCheck() {
    this.setState({ isMobilePortrait: window.innerWidth < 450 });
  }

  async newItem(newItem) {
    const postInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    };
    try {
      const response = await fetch('/api/items', postInit);
      const responseJSON = await response.json();
      if (!response.ok) {
        throw response;
      }
      const itemsToBuy = [...this.state.itemsToBuy, responseJSON];
      this.setState({
        itemsToBuy,
        inputFormFeedback: 'New Item Added'
      });
      this.handleFeedbackReset()
    } catch (error) {
      console.error(error);
      this.setState({
        inputFormFeedback: 'An Unexpected Error Occurred'
      })
      this.handleFeedbackReset()
    }
  }

  async deleteItem(event) {
    const id = parseInt(event.target.id);
    const deleteInit = { method: 'DELETE' };
    try {
      const response = await fetch(`/api/items/${id}`, deleteInit);
      const responseJSON = await response.json();
      const itemsToBuy = this.state.itemsToBuy.filter(index => index.itemid !== parseInt(responseJSON));
      this.setState({
        itemsToBuy,
        inputFormFeedback: 'Item Deleted'
      });
      this.handleFeedbackReset()
    } catch (error) {
      console.error(error);
      this.setState({
        inputFormFeedback: 'An Unexpected Error Occurred'
      })
      this.handleFeedbackReset()
    }
  }

  itemToUpdate(event) {
    const { name, title, value, id } = event.target;
    this.setState({
      itemToUpdate: {
        name,
        store: title,
        quantity: value,
        id
      }
    });
  }

  async updateItem(item) {
    const quantity = parseInt(item.quantity)
    const id = parseInt(item.itemId);
    const updateInit = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store: item.store,
        item: item.item,
        quantity: quantity
      })
    };
    try {
      const response = await fetch(`/api/items/${id}`, updateInit);
      const responseJSON = await response.json();
      if (!response.ok) {
        throw response;
      }
      const itemsToBuy = [...this.state.itemsToBuy];
      const indexOfUpdated = itemsToBuy.findIndex(index => index.itemid === responseJSON.itemid);
      itemsToBuy[indexOfUpdated] = responseJSON;
      this.setState({
        itemsToBuy,
        inputFormFeedback: 'Item Updated'
      });
      this.handleFeedbackReset()
    } catch (error) {
      console.error(error);
      this.setState({
        inputFormFeedback: 'An Unexpected Error Occurred'
      })
      this.handleFeedbackReset()
    }
  }

  setView(name, store) {
    const view = {
      name,
      store
    };
    this.setState({ view });
  }

  handleFeedbackReset() {
    setTimeout(() => {
      this.setState({ inputFormFeedback: '' })
    }, 3000)
  }

  handleRender() {
    let domView = null;
    const shoppingListView = (
      <>
        <Header />
        <div className="container">
          <div className="row">
            <div id="itemForm" className="col-12 col-md-6">
              <ItemForm newItem={this.newItem}
              // itemToUpdate={this.state.itemToUpdate}
              // updateItem={this.updateItem}
              />
            </div>
            <div id="CRUD-feedback" className="col-12 col-md-6 display-4 text-center">
              {this.state.inputFormFeedback}
            </div>
            <div id="itemTable" className="col-12">
              <ItemTable itemsToBuy={this.state.itemsToBuy}
                delete={this.deleteItem}
                update={this.itemToUpdate}
                itemToUpdate={this.state.itemToUpdate}
                isMobile={this.state.isMobilePortrait}
                setView={this.setView}
                updateItem={this.updateItem} />
            </div>
          </div>
        </div>
      </>
    );
    const storeView = (
      <>
        <Header />
        <div className="container">
          <div className="row">
            <ListByStore store={this.state.view.store} setView={this.setView} />
          </div>
        </div>
      </>
    );
    switch (this.state.view.name) {
      case 'shoppingList':
        domView = shoppingListView;
        break;
      case 'store':
        domView = storeView;
        break;
    }
    return domView;
  }

  render() {
    return this.handleRender();
  }
}

export default App;

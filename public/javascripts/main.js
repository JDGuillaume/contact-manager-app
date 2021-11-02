class Model {
  constructor() {
    this.contacts = [];
    this.getAllContacts();
  }

  getAllContacts() {
    // Retrieve All Contacts and Set State to Current Contact List
    this._myFetchJSON('api/contacts')
      .then(contacts => {
        this.contacts = contacts;
        console.log('All contacts were successfully retrieved.');
      })
      .catch(() => console.log(`An error occurred while attempting to retrieve your contact list.`));
  }

  getContact(id) {
    this._myFetchJSON(`api/contacts/${id}`)
      .then(contact => {
        return contact;
      })
      .catch(() => console.log(`The contact with an ID of ${id} could not be found.`));
  }

  deleteContact(id) {
    this._myFetch(`api/contacts/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        console.log(`The contact with an ID of ${id} was successfully deleted.`);
      })
      .catch(() => `An error occurred while attempting to delete the contact with an ID of ${id}.`);
  }

  addContact(contact) {
    this._myFetchJSON('api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: contact,
    })
      .then(data => {
        console.log(`${data.full_name} was added with an ID of ${data.id}.`);
      })
      .catch(() => `An error occurred while attempting to add the contact to our Contacts Manager.`);
  }

  updateContact(id, contact) {
    this._myFetchJSON(`api/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: contact,
    })
      .then(data => {
        console.log(`${data.full_name} (ID ${data.id}) was updated successfully!`);
      })
      .catch(() => console.log(`An error occurred while attempting to update your contact with an ID of ${id}.`));
  }

  async _myFetchJSON(resource, options) {
    const response = await fetch(resource, options);

    if (!response.ok) {
      throw new Error(`An HTTP ${response.status} Error occurred.`);
    }

    return response.json();
  }

  async _myFetch(resource, options) {
    const response = await fetch(resource, options);

    if (!response.ok) {
      throw new Error(`An HTTP ${response.status} Error occurred.`);
    }

    return response;
  }
}

class View {
  constructor() {
    // Select the root from which we will be switching views
    this.app = this.getElement('.main-container');

    // Get Handlebars Set Up
    this.templates = {};
    this.getHandlebarsTemplates();

    this.displayContacts();
  }

  getElement(selector) {
    return document.querySelector(selector);
  }

  getHandlebarsTemplates() {
    const allTemplates = document.querySelectorAll(`[type="text/x-handlebars"]`);
    const allPartials = document.querySelectorAll(`[data-type="partial"]`);

    allTemplates.forEach(template => {
      this.templates[template.id] = Handlebars.compile(template.innerHTML);
    });

    allPartials.forEach(partial => {
      Handlebars.registerPartial(partial.id, partial.innerHTML);
    });

    Handlebars.registerHelper('isdefined', value => {
      return value !== undefined;
    });
  }

  displayContacts(data = []) {
    this.removeExistingElements();

    // If there are contacts, display them.
    if (data.length) {
      this.app.insertAdjacentHTML('afterbegin', this.templates.contacts({ contacts: data }));
    } else {
      // If there aren't any contacts, display UI indicating such.
      this.app.insertAdjacentHTML('afterbegin', this.templates.noContacts());
    }
  }

  displayForm(data, id) {
    this.removeExistingElements();

    if (id) {
      this.app.insertAdjacentHTML('afterbegin', this.templates.form(data));
    } else {
      this.app.insertAdjacentHTML('afterbegin', this.templates.form());
    }
  }

  removeExistingElements() {
    // Remove Existing Elements
    for (let count = 0; count < this.app.children.length; count++) {
      this.app.removeChild(this.app.children[count]);
    }
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Display Initial State
    this.onContactChange(this.model.contacts);
  }

  onContactChange(contacts) {
    this.view.displayContacts(contacts);
  }

  handleDeleteContact(id) {
    this.model.deleteContact(id);
  }

  handleGetContact(id) {
    this.model.getContact(id);
  }

  handleAddContact(contact) {
    this.model.addContact(contact);
  }

  handleUpdateContact(id, contact) {
    this.model.updateContact(id, contact);
  }
}

const app = new Controller(new Model(), new View());

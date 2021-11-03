/* eslint-disable no-console */
class Model {
  constructor() {
    this.contacts = [];
  }

  getAllContacts() {
    try {
      return this._myFetchJSON('api/contacts');
    } catch {
      throw new Error('An error occurred while attempting to retrieve your contact list.');
    }
  }

  getContact(id) {
    try {
      return this._myFetchJSON(`api/contacts/${id}`);
    } catch {
      throw new Error(`The contact with an ID of ${id} could not be found.`);
    }
  }

  deleteContact(id) {
    this._myFetch(`api/contacts/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        console.log(`The contact with an ID of ${id} was successfully deleted.`);
      })
      .catch(() => `An error occurred while attempting to delete the contact with an ID of ${id}.`);

    this.onContactChange(this.contacts);
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

    this.onContactChange(this.contacts);
  }

  updateContact(id, contact) {
    try {
      this._myFetchJSON(`api/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: contact,
      }).then(data => {
        console.log(`${data.full_name} (ID ${data.id}) was updated successfully!`);
      });

      this.onContactChange(this.contacts);
    } catch {
      throw new Error(`An error occurred while attempting to update your contact with an ID of ${id}.`);
    }
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

  bindContactChanged(callback) {
    this.onContactChange = callback;
  }
}

class View {
  constructor() {
    // Select the root from which we will be switching views
    this.app = this.getElement('.main-container');

    // Get Handlebars Set Up
    this.templates = {};
    this.getHandlebarsTemplates();
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

  displayForm(data) {
    this.removeExistingElements();

    if (data) {
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

  bindAddContactButton(handler) {
    this.app.firstElementChild.addEventListener('click', event => {
      event.preventDefault();

      if (event.target.textContent === 'Add Contact') {
        handler();
      }
    });
  }

  bindDeleteButton(handler) {
    this.app.firstElementChild.addEventListener('click', event => {
      event.preventDefault();

      if (event.target.textContent === 'Delete') {
        const id = event.target.closest('li').dataset.id;
        handler(id);
      }
    });
  }

  bindEditButton(handler) {
    this.app.firstElementChild.addEventListener('click', event => {
      event.preventDefault();

      if (event.target.textContent === 'Edit') {
        const id = event.target.closest('li').dataset.id;
        handler(id);
      }
    });
  }

  bindSubmitButton(handler) {
    const form = this.getElement('#contactForm');

    form.addEventListener('click', event => {
      event.preventDefault();

      if (event.target.textContent === 'Submit') {
        const id = event.target.closest('form').dataset.id;
        const inputs = [...document.querySelectorAll('input')].map(input => input.value);

        const data = JSON.stringify({
          full_name: inputs[0],
          email: inputs[1],
          phone_number: inputs[2],
          tags: inputs[3],
        });

        console.log(data);

        if (id) {
          handler(id, data);
        } else {
          handler(data);
        }
      }
    });
  }

  bindCancelButton(handler) {
    this.app.firstElementChild.addEventListener('click', event => {
      event.preventDefault();

      if (event.target.textContent === 'Cancel') {
        handler();
      }
    });
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindContactChanged(this.onContactChange);

    // Display Initial State
    this.retrieveAndRenderAllContacts();
  }

  onContactChange = () => {
    this.retrieveAndRenderAllContacts();
  };

  handleDeleteContact = id => {
    this.model.deleteContact(id);
  };

  handleGetContact = id => {
    this.model.getContact(id);
  };

  handleAddContact = contact => {
    this.model.addContact(contact);
  };

  handleUpdateContact = (id, contact) => {
    this.model.updateContact(id, contact);
  };

  async retrieveAndRenderAllContacts() {
    this.model.contacts = await this.model.getAllContacts();
    console.log('All contacts retrieved successfully.');

    this.renderContacts(this.model.contacts);
  }

  renderAllContacts = () => {
    this.renderContacts(this.model.contacts);
  };

  renderContacts = contacts => {
    this.view.displayContacts(contacts);
    this.view.bindAddContactButton(this.renderForm);
    this.view.bindDeleteButton(this.handleDeleteContact);
    this.view.bindEditButton(this.renderFormForUpdate);
  };

  renderForm = () => {
    this.view.displayForm();
    this.view.bindCancelButton(this.renderAllContacts);
    this.view.bindSubmitButton(this.handleAddContact);
  };

  renderFormForUpdate = async id => {
    const contact = await this.model.getContact(id);
    console.log(`${contact.full_name} (ID ${id}) retrieved successfully and ready for editing.`);

    this.view.displayForm(contact);
    this.view.bindSubmitButton(this.handleUpdateContact);
    this.view.bindCancelButton(this.renderAllContacts);
  };
}

const app = new Controller(new Model(), new View());

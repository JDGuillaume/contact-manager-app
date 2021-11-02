class Model {
  constructor() {
    this.contacts = null;
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
  constructor() {}
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
}

const app = new Controller(new Model(), new View());

// document.addEventListener('DOMContentLoaded', () => {
//   class ContactManager {
//     constructor() {
//       // Grab Initial Elements
//       this.container = document.querySelector('.main-container');
//       this.setDiv();

//       // Set Initial State
//       this.contacts = null;
//       this.form = null;

//       // Grab Handlebar Teampltes and Set to Templates Object
//       this.templates = {};
//       this.getHandlebarsTemplates();

//       // Retrieve Initial Data
//       this.getContacts();
//     }

//     async getContacts() {
//       const data = await fetch('api/contacts');
//       this.contacts = await data.json();
//     }

//     getHandlebarsTemplates() {
//       const allTemplates = document.querySelectorAll(
//         `[type="text/x-handlebars"]`
//       );

//       const allPartials = document.querySelectorAll(`[data-type="partial"]`);

//       allTemplates.forEach(template => {
//         this.templates[template.id] = Handlebars.compile(template.innerHTML);
//       });

//       allPartials.forEach(partial => {
//         Handlebars.registerPartial(partial.id, partial.innerHTML);
//       });
//     }

//     renderContacts(data = false) {
//       this.div.remove();
//       this.container.insertAdjacentHTML(
//         'afterbegin',
//         this.templates.contacts({ contacts: data })
//       );
//       this.setDiv();
//     }

//     renderForm(data = false) {
//       this.div.remove();
//       this.container.insertAdjacentHTML(
//         'afterbegin',
//         this.templates.form(data)
//       );

//       this.setDiv();

//       this.form = document.querySelector('form');
//       this.bindSubmitListener();
//     }

//     setDiv() {
//       this.div = document.querySelector('[style=""]');
//     }

//     bindSubmitListener() {
//       console.log('Binding Submit Listner');

//       this.form.addEventListener('submit', event => {
//         event.preventDefault();

//         const data = new FormData(this.form);
//         const queryString = new URLSearchParams(data);

//         fetch('api/contacts', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//           },
//           body: queryString,
//         });
//       });
//     }
//   }

//   const app = new ContactManager();

//   app.container.addEventListener('click', event => {
//     event.preventDefault();

//     if (['Add Contact'].includes(event.target.textContent)) {
//       app.renderForm();
//     }

//     if (['Cancel'].includes(event.target.textContent)) {
//       app.renderContacts(app.contacts);
//     }

//     if (['Submit'].includes(event.target.textContent)) {
//       app.form.requestSubmit();
//       app.renderContacts(app.contacts);
//     }
//   });
// });

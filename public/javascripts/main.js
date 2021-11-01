document.addEventListener('DOMContentLoaded', () => {
  class ContactManager {
    constructor() {
      // Grab Initial Elements
      this.container = document.querySelector('.main-container');
      this.setDiv();

      // Set Initial State
      this.contacts = null;
      this.form = null;

      // Grab Handlebar Teampltes and Set to Templates Object
      this.templates = {};
      this.getHandlebarsTemplates();

      // Retrieve Initial Data
      this.getContacts();
    }

    async getContacts() {
      const data = await fetch('api/contacts');
      this.contacts = await data.json();
    }

    getHandlebarsTemplates() {
      const allTemplates = document.querySelectorAll(
        `[type="text/x-handlebars"]`
      );

      const allPartials = document.querySelectorAll(`[data-type="partial"]`);

      allTemplates.forEach(template => {
        this.templates[template.id] = Handlebars.compile(template.innerHTML);
      });

      allPartials.forEach(partial => {
        Handlebars.registerPartial(partial.id, partial.innerHTML);
      });
    }

    renderContacts(data = false) {
      this.div.remove();
      this.container.insertAdjacentHTML(
        'afterbegin',
        this.templates.contacts({ contacts: data })
      );
      this.setDiv();
    }

    renderForm(data = false) {
      this.div.remove();
      this.container.insertAdjacentHTML(
        'afterbegin',
        this.templates.form(data)
      );

      this.setDiv();

      this.form = document.querySelector('form');
      this.bindSubmitListener();
    }

    setDiv() {
      this.div = document.querySelector('[style=""]');
    }

    bindSubmitListener() {
      console.log('Binding Submit Listner');

      this.form.addEventListener('submit', event => {
        event.preventDefault();

        const data = new FormData(this.form);
        const queryString = new URLSearchParams(data);

        fetch('api/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: queryString,
        });
      });
    }
  }

  const app = new ContactManager();

  app.container.addEventListener('click', event => {
    event.preventDefault();

    if (['Add Contact'].includes(event.target.textContent)) {
      app.renderForm();
    }

    if (['Cancel'].includes(event.target.textContent)) {
      app.renderContacts(app.contacts);
    }

    if (['Submit'].includes(event.target.textContent)) {
      app.form.requestSubmit();
      app.renderContacts(app.contacts);
    }
  });
});

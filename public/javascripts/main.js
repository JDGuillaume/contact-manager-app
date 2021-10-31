document.addEventListener('DOMContentLoaded', () => {
  class ContactManager {
    constructor() {
      this.contacts = null;
      this.container = document.querySelector('.main-container');
      this.setDiv();
      this.templates = {};
      this.getHandlebarsTemplates();
      this.getContacts();
      this.form = null;
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

      this.form = document.querySelector('form');

      this.form.addEventListener('submit', event => {
        event.preventDefault();
        console.log(`Why won't you print`);
      });
      this.setDiv();
    }

    setDiv() {
      this.div = document.querySelector('[style=""]');
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
  });
});

class ProjetctList {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLFormElement;

  constructor(private type: 'active' | 'finished') {
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.templateElement = document.getElementById(
      'project-list'
    )! as HTMLTemplateElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = `${this.type}-projects`;
    this.attach();
    this.renderContent();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }

  private renderContent() {
    this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}

class ProjetctInput {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.templateElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';
    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }

  validateUserInput(): boolean {
    return (
      validateInputString({
        value: this.titleInputElement.value,
        required: true,
        minLength: 3,
        maxLength: 20,
      }) &&
      validateInputString({
        value: this.descriptionInputElement.value,
        minLength: 5,
      }) &&
      validateInputNumber({
        value: this.peopleInputElement.value,
        min: 1,
      })
    );
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    if (this.validateUserInput()) {
      console.log([
        this.titleInputElement.value,
        this.descriptionInputElement.value,
        this.peopleInputElement.value,
      ]);
    } else {
      alert('please try again!');
    }
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

// validation

interface ValidatableInputBase {
  value: string;
  required?: boolean;
}
interface ValidatableInputString extends ValidatableInputBase {
  minLength?: number;
  maxLength?: number;
}
interface ValidatableInputNumber extends ValidatableInputBase {
  min?: number;
  max?: number;
}
function validateInputString(input: ValidatableInputString): boolean {
  const defaultRequired = false;
  const defaultMinLength = 1;
  const defaultMaxLength = 1000;

  if (input.value.length === 0 && (input.required ?? defaultRequired)) {
    return false;
  }
  if (input.value.length < (input.minLength ?? defaultMinLength)) {
    return false;
  }
  if (input.value.length > (input.maxLength ?? defaultMaxLength)) {
    return false;
  }
  return true;
}
function validateInputNumber(input: ValidatableInputNumber): boolean {
  const defaultRequired = false;
  const defaultMin = 1;
  const defaultMax = 1000;

  if (input.value.length === 0 && (input.required ?? defaultRequired)) {
    return false;
  }
  let inputNumber = parseInt(input.value);
  if (isNaN(inputNumber)) {
    return false;
  }
  if (input.value.length < (input.min ?? defaultMin)) {
    return false;
  }
  if (input.value.length > (input.max ?? defaultMax)) {
    return false;
  }
  return true;
}

// binding

function Autobind(_: any, _2: any, descriptor: PropertyDescriptor) {
  return {
    configurable: true,
    enumerable: false,
    get() {
      return descriptor.value.bind(this);
    },
  } as PropertyDescriptor;
}

// init

new ProjetctInput();
new ProjetctList('active');
new ProjetctList('finished');

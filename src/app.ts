// import { v4 as uuidv4 } from 'uuid';

enum ProjectStatus {
  Active,
  Fininshed,
}

class Project {
  public id: string;
  // private title: string;
  // private description: string;
  // private people: number;
  // private status: ProjectStatus;

  // constructor(title: string, description: string, people: number, status: ProjectStatus) {
  //   this.id = Date.now.toString();
  //   this.title = title;
  //   this.description = description;
  //   this.people = people;
  //   this.status = status;
  // }
  constructor(
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {
    this.id = Date.now.toString();
  }
}

// Project state management

type Listener = (items: Project[]) => void;

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  static instance: ProjectState;

  static getInstance() {
    if (!this.instance) return new ProjectState();
    return this.instance;
  }

  addListener(listener: Listener) {
    this.listeners.push(listener);
  }

  addProject(title: string, description: string, people: number) {
    this.projects.push(
      new Project(title, description, people, ProjectStatus.Active)
    );
    for (const listener of this.listeners) {
      listener([...this.projects]);
    }
  }
}

const projectState = ProjectState.getInstance();

class ProjetctList {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLFormElement;
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.templateElement = document.getElementById(
      'project-list'
    )! as HTMLTemplateElement;
    this.assignedProjects = [];

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(
        (project) =>
          ProjectStatus[project.status].toString().toLowerCase() == this.type
      );
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    ) as HTMLUListElement;
    listEl.innerHTML = '';
    for (const project of this.assignedProjects) {
      const liEl = document.createElement('li');
      liEl.textContent = project.title;
      listEl.appendChild(liEl);
    }
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }

  private renderContent() {
    this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
    this.element.querySelector(
      'h2'
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
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
    if (!this.validateUserInput()) {
      alert('please try again!');
      return;
    }
    projectState.addProject(
      this.titleInputElement.value,
      this.descriptionInputElement.value,
      +this.peopleInputElement.value
    );
    this.clearInputs();
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
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

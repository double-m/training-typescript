// import { v4 as uuidv4 } from 'uuid';

enum ProjectStatus {
  Active,
  Fininshed,
}

class Project {
  public id: string;

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

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}

class ProjectState extends State<Project>{
  private projects: Project[] = [];
  static instance: ProjectState;

  static getInstance() {
    if (!this.instance) return new ProjectState();
    return this.instance;
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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  hostElement: T;
  templateElement: HTMLTemplateElement;
  element: U;

  constructor(
    hostElementId: string,
    templateElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.hostElement = document.getElementById(hostElementId)! as T;
    this.templateElement = document.getElementById(
      templateElementId
    )! as HTMLTemplateElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAfterBegin: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAfterBegin ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('app', 'project-list', false, `${type}-projects`);

    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(
        (project) =>
          ProjectStatus[project.status].toString().toLowerCase() == this.type
      );
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
    this.element.querySelector(
      'h2'
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
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
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('app', 'project-input', false, 'user-input');

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
    this.renderContent();
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent() {}

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

new ProjectInput();
new ProjectList('active');
new ProjectList('finished');

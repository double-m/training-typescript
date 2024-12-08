class ProjetctInput {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;

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

    this.configure();
    this.attach();
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log('sumbitted:');
    console.log(`title: "${this.titleInputElement.value}"`);
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

function Autobind(_: any, _2: any, descriptor: PropertyDescriptor) {
  return {
    configurable: true,
    enumerable: false,
    get() {
      return descriptor.value.bind(this);
    },
  } as PropertyDescriptor;
}

new ProjetctInput();

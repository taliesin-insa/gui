import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {getIdAndValue, getUnreadableFlag, Snippet} from '../model/Snippet';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError, first} from 'rxjs/operators';
import {SessionStorageService} from '../services/session-storage.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss']
})
export class AnnotationComponent implements OnInit, AfterViewInit {

  @ViewChildren('annotationInput') annotationInputs: QueryList<ElementRef>;
  @ViewChild('nextLines', { static : false}) nextLinesButton: ElementRef;
  @ViewChildren('card') card: QueryList<ElementRef>;

  snippets: Snippet[] = []; // Batch of snippets
  annotationForm: FormGroup; // Form that contains text inputs for snippets' transcriptions
  private NB_OF_SNIPPETS = 20; // Number of snippets inside the batch to annotate

  private handleError: HandleError;

  private hover = -1 ;

  private isRecognizerActivated: boolean;
  private recognizerButtonClass: string;
  private recognizerButtonText: string;

  constructor(private router: Router,
              private fb: FormBuilder,
              private http: HttpClient,
              private session: SessionStorageService,
              httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('Annotation');
    this.isRecognizerActivated = true;
    this.recognizerButtonClass = 'btn btn-warning suggest font-weight-bold' ;
    this.recognizerButtonText = 'Suggestions activées';
  }

  ngOnInit() {
    this.annotationForm = this.fb.group({
      snippetInputs: this.fb.array([])
    });

    this.retrieveSnippetsDB(this.NB_OF_SNIPPETS);
  }

  ngAfterViewInit() {
    this.annotationInputs.changes.pipe(first()).subscribe(changes => {
      if (changes.toArray().length > 0) {
        changes.toArray()[0].nativeElement.focus();
      }
    });
  }

  /** Getter used to retrieve the list of snippet inputs
   * Each text input inside this array is a FormControl, representing the transcription of the n-th snippet
   */
  get formArrayInputs() {
    return this.annotationForm.get('snippetInputs') as FormArray;
  }

  /**
   * Add a text input in the annotation form for each snippet.
   * The 1st snippet is associated with the 1st FormControl.
   * The inputs are initialized with the value of the snippets, in case there is already a transcription for them (produced by a recognizer)
   */
  fillAnnotationForm() {
    this.snippets.forEach(snippet => {
      this.formArrayInputs.push(
        this.fb.control(snippet.value, Validators.required)
      );
    });
    window.scroll(0, 0);
  }

  /**
   * Called when the user finished annotating all the snippets.
   * Get all the transcriptions made by the user, update the snippets' value and then retrieve new snippets to annotate.
   *
   * @param annotationFormData JSON representation of the form and all its data
   */
  onSubmit(annotationFormData: any) {
    // Update snippets' value based on user inputs
    const modifiedSnippetInputs = annotationFormData.snippetInputs;
    for (let i = 0; i < modifiedSnippetInputs.length; i++) {
      this.snippets[i].value = modifiedSnippetInputs[i];
    }
    // Clear inputs since we will get new snippets
    this.formArrayInputs.clear();

    // Update data in backend: snippets for which the annotation hasn't been validated
    const snippetsToValidate = this.snippets.filter(snippet => (!snippet.annotated && !snippet.unreadable));
    if (snippetsToValidate.length > 0) {
      this.updateManySnippetsDB(snippetsToValidate);
    }

    // Get new snippets to annotate
    this.retrieveSnippetsDB(this.NB_OF_SNIPPETS);
  }

  /* ===== DYNAMIC INTERACTIONS ===== */

  /**
   * Focuses the next input in the array of snippet text inputs
   *
   * Add (or remove) classes to show visuals indicators for the user
   *
   * @param id of the current input
   */
  changeFocus(id: number) {
    const annotationsInputsArray = this.annotationInputs.toArray();
    let nextId = id + 1;
    if (nextId === annotationsInputsArray.length) {
      // We are at the bottom at the page, suppose all the snippets are annotated
      this.nextLinesButton.nativeElement.focus();
      this.nextLinesButton.nativeElement.click();
    } else {
      // Try to find the next input that isn't disabled (unreadable)
      while (annotationsInputsArray[nextId].nativeElement.disabled) {
        nextId++;
      }
      if (!this.snippets[id].unreadable) {
        annotationsInputsArray[id].nativeElement.classList.remove('bg-unreadable');
        annotationsInputsArray[id].nativeElement.classList.add('bg-validated');
      }
      annotationsInputsArray[id].nativeElement.classList.remove('border-active');
      annotationsInputsArray[nextId].nativeElement.focus();
      annotationsInputsArray[nextId].nativeElement.classList.add('border-active');
    }
  }

  /**
   * Focuses the clicked input in the array of snippet text inputs
   *
   * Add (or remove) classes to show visuals indicators for the user
   *
   * @param id of the current input
   */

  focusClick(id: number) {
    const annotationsInputsArray = this.annotationInputs.toArray();
    for ( const elem of annotationsInputsArray) {
        elem.nativeElement.classList.remove('border-active');
    }
    annotationsInputsArray[id].nativeElement.classList.add('border-active');
    annotationsInputsArray[id].nativeElement.focus();
  }

  /**
   * Changes current hovered card
   */
  setHover(id: number) {
    this.hover = id;
  }

  /**
   * Called when leaving hovered card
   */
  leaveHover() {
    this.hover = -1;
  }

  changeClassesCard(id: number) {
    let classValue = '';
    if (id === this.hover) {
      classValue += ' border-active';
    } else {
      classValue += '';
    }
    return classValue;
  }


  /**
   * Change current snippet input readability.
   * In case it was tagged readable:
   * Remove all validators from the associated input field, disable it and then focus the next input.
   *
   * If the input was unreadable:
   * Put back all necessary validators
   *
   * Add (or remove) classes to show visuals indicators for the user
   *
   * @param id of the actual snippet
   */
  setUnreadable(id: number) {
    const annotationsInputsArray = this.annotationInputs.toArray();
    this.snippets[id].unreadable = !this.snippets[id].unreadable;
    const input = this.formArrayInputs.at(id);

    if (this.snippets[id].unreadable) {
      input.disable();
      input.clearValidators();
      annotationsInputsArray[id].nativeElement.classList.remove('bg-validated');
      annotationsInputsArray[id].nativeElement.classList.add('bg-unreadable');
      this.changeFocus(id);
    } else {
      input.enable();
      input.setValidators(Validators.required);
      annotationsInputsArray[id].nativeElement.classList.remove('bg-unreadable');
    }
    input.updateValueAndValidity();

    this.http.put('db/update/flags', [getUnreadableFlag(this.snippets[id])], {})
      .pipe(catchError(this.handleError('setUnreadable', undefined)))
      .subscribe();
  }

  /**
   * Send the annotated snippet to the backend, and focus the next image
   *
   * @param id of the annotated snippet
   */
  validateAnnotation(id: number) {
    const snippet = this.snippets[id];
    const input = this.formArrayInputs.at(id);
    if (!input.invalid) {
      snippet.value = input.value;
      snippet.annotated = true;
      this.updateSnippetDB(snippet);
      this.changeFocus(id);
    }
  }

  /* ===== HTTP REQUESTS ===== */

  /**
   * Retrieves a given number of snippets from the database. Expected format:
   * [ { id: string, url: string, value: string}, ... ]
   * where url is the url of the image and value is its transcription (if one exists, empty otherwise)
   *
   * @param nbOfSnippets we want to retrieve
   */
  retrieveSnippetsDB(nbOfSnippets: number) {
    this.snippets = []; // Clear snippet list before getting new ones
    this.http.get<Snippet[]>(`db/retrieve/snippets/${nbOfSnippets}`)
      // Handle HTTP error: 1st param = name of the function that might fail, 2nd param = default value returned in case of error
      .pipe(catchError(this.handleError('retrieveSnippetsDB', [])))
      // Function handling the result of the HTTP request. Returned value might either be the wanted one or the default one specified above
      .subscribe(returnedData => {
        returnedData.forEach(dbEntry => this.snippets.push(new Snippet(dbEntry)));
        this.fillAnnotationForm();
      });
  }

  /**
   * Send the annotated snippet to the database. Called after annotating one snippet (once its transcription is correct).
   * Format of the data sent:
   * [ { id: string, value: string} ]
   */
  updateSnippetDB(snippet: Snippet) {
    const updatedSnippet = [ getIdAndValue(snippet) ];
    this.http.put('db/update/value/' + this.session.getUser(), updatedSnippet, {})
      .pipe(catchError(this.handleError('updateSnippetsDB', undefined)))
      .subscribe();
  }

  /**
   * Send the annotated snippets to the database. Called before getting new snippets, to validate snippets that haven't been already.
   * Format of the data sent:
   * [ { id: string, value: string}, ... ]
   */
  updateManySnippetsDB(snippetList: Array<Snippet>) {
    const updatedSnippetList = snippetList.map(snippet => getIdAndValue(snippet));
    this.http.put('db/update/value/' + this.session.getUser(), updatedSnippetList, {})
      .pipe(catchError(this.handleError('updateSnippetsDB', undefined)))
      .subscribe();
  }

  updateRecognizerActivation() {
    this.isRecognizerActivated = !this.isRecognizerActivated;

    if (this.isRecognizerActivated) {
      this.recognizerButtonClass = 'btn btn-warning suggest font-weight-bold';
      this.recognizerButtonText = 'Suggestions activées';
    } else {
      this.recognizerButtonClass = 'btn btn-warning bg-transparent suggest font-weight-bold';
      this.recognizerButtonText = 'Suggestions désactivées';
    }
  }

}

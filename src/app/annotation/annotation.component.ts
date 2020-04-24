import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {Router} from '@angular/router';
import {getIdAndValue, getUnreadableFlag, Snippet} from '../model/Snippet';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError, first} from 'rxjs/operators';
import {SessionStorageService} from '../services/session-storage.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

const NB_OF_SNIPPETS_TO_GET = 20; // Number of snippets inside the batch to annotate

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss']
})
export class AnnotationComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('annotationInput') annotationInputs: QueryList<ElementRef>;
  @ViewChild('nextLines', { static : false}) nextLinesButton: ElementRef;
  @ViewChildren('inputCard') inputsCards: QueryList<ElementRef>;

  snippets: Snippet[] = [];             // Batch of snippets
  private hasReceivedSnippets = false;  // True if there are snippets to annotate
  private imagesLoading = true;         // Used to display a loading spinner while retrieving snippets

  annotationForm: FormGroup;  // Form that contains text inputs for snippets' transcriptions
  private handleError: HandleError;

  private hoveredCard = -1 ; // Indicator to know which card is currently hovered
  private focusedInput = 0;  // Indicator to know which input is currently focused

  // Attributes used when enabling/disabling the automatic suggestions
  private isRecognizerActivated: boolean;
  private recognizerButtonClass: string;
  private recognizerButtonText: string;

  constructor(private router: Router,
              private fb: FormBuilder,
              private http: HttpClient,
              private session: SessionStorageService,
              private modalService: NgbModal,
              private httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('Annotation');
    this.isRecognizerActivated = true;
    this.recognizerButtonClass = 'btn btn-warning suggest font-weight-bold' ;
    this.recognizerButtonText = 'Suggestions activées';
  }

  ngOnInit() {
    this.annotationForm = this.fb.group({
      snippetInputs: this.fb.array([])
    });

    this.retrieveSnippetsDB(NB_OF_SNIPPETS_TO_GET);
  }

  ngAfterViewInit() {
    this.annotationInputs.changes.pipe(first()).subscribe(changes => {
      if (changes.toArray().length > 0) {
        changes.toArray()[0].nativeElement.focus();
      }
    });
  }

  ngOnDestroy() {
    this.httpErrorHandler.clearErrors();
  }

  /* ============================== FORM RELATED FUNCTIONS ============================== */

  /**
   * Getter used to retrieve the list of snippet inputs
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
    this.retrieveSnippetsDB(NB_OF_SNIPPETS_TO_GET);
  }

  /* ============================== DYNAMIC INTERACTIONS (focus, scroll, hover) ============================== */

  /**
   * Focuses the next input in the array of snippet text inputs that is enabled
   *
   * @param currentInput: id of the actual input
   * @param canSubmit: tells if the form can be submitted if it is completed
   * @param avoidAnnotated: if true won't focus the annotated inputs
   */
  focusNextInput(currentInput: number, canSubmit: boolean, avoidAnnotated: boolean) {
    if (canSubmit && this.annotationForm.valid &&
      this.snippets.filter(snippet => snippet.unreadable || snippet.annotated).length === this.snippets.length) {
      // Form valid, all the fields are validated or unreadable
      this.nextLinesButton.nativeElement.disabled = false;
      this.nextLinesButton.nativeElement.focus();
      this.nextLinesButton.nativeElement.click();
    } else {                              // form invalid, some snippets still need to be completed
      const annotationsInputsArray = this.annotationInputs.toArray();
      const len = annotationsInputsArray.length;
      let nextInput = (currentInput  + 1) % len;

      // Try to find the next input that isn't validated or unreadable, cycle back to top if necessary
      while (this.snippets[nextInput].unreadable || (avoidAnnotated && this.snippets[nextInput].annotated)) {
        nextInput = (nextInput + 1) % len;
      }

      this.focusedInput = nextInput;
      annotationsInputsArray[nextInput].nativeElement.focus({preventScroll: true});
      // smooth scroll
      annotationsInputsArray[nextInput].nativeElement.parentElement.parentElement
        .scrollIntoView({behavior: 'smooth', block: 'center'}  );
    }
  }

  /**
   * Focuses the previous input in the array of snippet text inputs that is enabled
   *
   * @param currentInput id of the actual input
   */
  focusPreviousInput(currentInput: number) {
    const annotationsInputsArray = this.annotationInputs.toArray();
    const len = annotationsInputsArray.length;
    let previousInput = (currentInput + len - 1) % len;

    // Try to find the previous input that isn't unreadable, cycle back to bottom if necessary
    while (this.snippets[previousInput].unreadable) {
      previousInput = (previousInput + len - 1) % len;
    }

    this.focusedInput = previousInput;
    annotationsInputsArray[previousInput].nativeElement.focus({preventScroll: true});
    // smooth scroll
    annotationsInputsArray[previousInput].nativeElement.parentElement.parentElement
      .scrollIntoView({behavior: 'smooth', block: 'center'}  );
  }

  /* ============================== ANNOTATION RELATED INTERACTIONS ============================== */


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
    const snippet = this.snippets[id];
    snippet.unreadable = !snippet.unreadable;
    snippet.changed = true;

    this.updateFlagUnreadableDB(snippet);

    const annotationsInputsArray = this.annotationInputs.toArray();
    const input = this.formArrayInputs.at(id);

    if (snippet.unreadable) {   // Unreadable
      input.disable();
      input.clearValidators();
      input.updateValueAndValidity();
      annotationsInputsArray[id].nativeElement.classList.add('bg-unreadable');
      this.focusNextInput(id, true, true);
    } else {                    // Readable
      input.enable();
      input.setValidators(Validators.required);
      annotationsInputsArray[id].nativeElement.classList.remove('bg-unreadable');
    }
    input.updateValueAndValidity();
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
      snippet.changed = true;
      snippet.value = input.value;
      snippet.annotated = true;

      this.updateSnippetDB(snippet);

      this.annotationInputs.toArray()[id].nativeElement.classList.add('bg-validated');
      this.focusNextInput(id, true, true);
    }
  }

  /**
   * Changes the input fields to display or not the recognizer's suggestions,
   * whether the user has activated them or not
   */
  updateRecognizerActivation() {
    this.isRecognizerActivated = !this.isRecognizerActivated;

    if (this.isRecognizerActivated) { // Suggestions ON
      this.recognizerButtonClass = 'btn btn-warning suggest font-weight-bold';
      this.recognizerButtonText = 'Suggestions activées';

      // Change value inside inputs
      for (let i = 0; i < this.snippets.length; i++) {
        if (!this.snippets[i].changed) {    // Untouched input, empty -> we put back the suggestion
          this.formArrayInputs.at(i).setValue(this.snippets[i].value);
          this.snippets[i].changed = false;
        } // else, the user has written text as well, we let its modification
      }

    } else {                          // Suggestions OFF
      this.recognizerButtonClass = 'btn btn-warning bg-transparent suggest font-weight-bold';
      this.recognizerButtonText = 'Suggestions désactivées';

      // Change value inside inputs
      for (let i = 0; i < this.snippets.length; i++) {
        if (!this.snippets[i].changed) {    // Untouched input, only the suggestion -> we remove it
          this.formArrayInputs.at(i).setValue('');
          this.snippets[i].changed = false;
        } // else, the user has written text as well, we let its modification
      }
    }
  }

  /* ============================== HTTP REQUESTS ============================== */

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
        if (returnedData !== null) {
          returnedData.forEach(dbEntry => this.snippets.push(new Snippet(dbEntry)));
          this.fillAnnotationForm();
          this.hasReceivedSnippets = true;
        } else {
          this.hasReceivedSnippets = false;
        }
        this.imagesLoading = false;
      });
  }

  /**
   * Send the annotated snippet to the database. Called after annotating one snippet (once its transcription is correct).
   * Format of the data sent:
   * [ { id: string, value: string} ]
   */
  updateSnippetDB(snippet: Snippet) {
    const updatedSnippet = [ getIdAndValue(snippet) ];
    this.http.put('db/update/value/' + this.session.getUser()[`Username`], updatedSnippet, {})
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
    this.http.put('db/update/value/' + this.session.getUser()[`Username`], updatedSnippetList, {})
      .pipe(catchError(this.handleError('updateSnippetsDB', undefined)))
      .subscribe();
  }

  updateFlagUnreadableDB(snippet: Snippet) {
    this.http.put('db/update/flags', [getUnreadableFlag(snippet)], {})
      .pipe(catchError(this.handleError('setUnreadable', undefined)))
      .subscribe();
  }
}

import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {Router} from '@angular/router';
import {getIdAndValue, getUnreadableFlag, Snippet} from '../model/Snippet';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError} from 'rxjs/operators';
import {ToastService} from '../toast-global/toast-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss']
})
export class AnnotationComponent implements OnInit, AfterViewInit {

  @ViewChildren('annotationInput') annotationInputs: QueryList<ElementRef>;
  @ViewChild('nextLines', { static : false}) nextLinesButton: ElementRef;

  snippets: Snippet[] = []; // Batch of snippets
  annotationForm: FormGroup; // Form that contains text inputs for snippets' transcriptions
  private NB_OF_SNIPPETS = 20; // Number of snippets inside the batch to annotate

  private handleError: HandleError;


  constructor(private router: Router,
              private fb: FormBuilder,
              private http: HttpClient,
              httpErrorHandler: HttpErrorHandler,
              private toastService: ToastService) {
    this.handleError = httpErrorHandler.createHandleError('Annotation');
  }

  ngOnInit() {
    this.annotationForm = this.fb.group({
      snippetInputs: this.fb.array([])
    });

    this.retrieveSnippetsDB(this.NB_OF_SNIPPETS);
  }

  ngAfterViewInit() {
    this.annotationInputs.changes.subscribe(changes => {
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

    // Update data in backend: snippets for which the annotation hasn't been validated and those which are tagged unreadable
    const snippetsToValidate = this.snippets.filter(snippet => (!snippet.annotated && !snippet.unreadable));
    if (snippetsToValidate.length > 0) {
      this.updateManySnippetsDB(snippetsToValidate);
    }
    this.updateFlagsUnreadableDB();

    // Get new snippets to annotate
    this.retrieveSnippetsDB(this.NB_OF_SNIPPETS);
  }

  /* ===== DYNAMIC INTERACTIONS ===== */

  /**
   * Focuses the next input in the array of snippet text inputs
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
      annotationsInputsArray[nextId].nativeElement.focus();
    }
  }

  /**
   * Change current snippet input readability.
   * In case it was tagged readable:
   * Remove all validators from the associated input field, disable it and then focus the next input.
   *
   * If the input was unreadable:
   * Put back all necessary validators
   *
   * @param id of the actual snippet
   */
  unreadable(id: number) {
    this.snippets[id].unreadable = !this.snippets[id].unreadable;
    const input = this.formArrayInputs.at(id);

    if (this.snippets[id].unreadable) {
      input.disable();
      input.clearValidators();
      this.changeFocus(id);
    } else {
      input.enable();
      input.setValidators(Validators.required);
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
      .pipe(
        catchError(this.handleError('retrieveSnippetsDB', []))
      )
      // Function handling the result of the HTTP request. Returned value might either be the wanted one or the default one specified above
      .subscribe(returnedData => {
        this.toastService.showSuccess('Received snippets: \n' + JSON.stringify(returnedData));
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
    this.toastService.showStandard('Sent to db/update/value: \n' + JSON.stringify(updatedSnippet));
    this.http.put('db/update/value', updatedSnippet, {})
      .pipe(catchError(this.handleError('updateSnippetsDB', undefined)))
      .subscribe(response => this.toastService.showDanger(response.toString()));
  }

  /**
   * Send the annotated snippets to the database. Called before getting new snippets, to validate snippets that haven't been already.
   * Format of the data sent:
   * [ { id: string, value: string}, ... ]
   */
  updateManySnippetsDB(snippetList: Array<Snippet>) {
    const updatedSnippetList = snippetList.map(snippet => getIdAndValue(snippet));
    this.toastService.showStandard('Sent to db/update/value: \n' + JSON.stringify(updatedSnippetList));
    this.http.put('db/update/value', updatedSnippetList, {})
      .pipe(
        catchError(this.handleError('updateSnippetsDB', undefined))
      );
  }

  /**
   * Send an array of all the unreadable snippets to update their flag in the database.
   * Format of the data sent:
   * [ { id: string, flag: "unreadable", value: true }, ...]
   */
  updateFlagsUnreadableDB() {
    const unreadableSnippets = this.snippets.filter(snippet => snippet.unreadable)
                                            .map(snippet => getUnreadableFlag(snippet));
    if (unreadableSnippets.length > 0) {
      this.toastService.showStandard('Sent to db/update/flags: \n' + JSON.stringify(unreadableSnippets));
      this.snippets = this.snippets.filter(snippet => !snippet.unreadable);
      this.http.put('db/update/flags', unreadableSnippets, {})
        .pipe(
          catchError(this.handleError('updateFlagsUnreadableDB', undefined))
        );
    }
  }

}

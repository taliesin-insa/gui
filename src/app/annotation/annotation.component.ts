import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {getIdAndValue, getUnreadableFlag, Snippet} from '../model/Snippet';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {HandleError, HttpErrorHandler} from '../services/http-error-handler.service';
import {catchError} from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss']
})
export class AnnotationComponent implements OnInit {

  snippets: Snippet[] = []; // Batch of snippets
  annotationForm: FormGroup; // Form that contains text inputs for snippets' transcriptions
  private NB_OF_SNIPPETS = 20; // Number of snippets inside the batch to annotate

  private handleError: HandleError;


  constructor(private router: Router, private fb: FormBuilder, private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('Annotation');
  }

  ngOnInit() {
    this.annotationForm = this.fb.group({
      snippetInputs: this.fb.array([])
    });

    this.retrieveSnippetsDB(this.NB_OF_SNIPPETS);
  }

  /** Getter used to retrieve the list of snippet inputs
   * Each text input inside this array is a FormControl, representing the transcription of the n-th snippet
   */
  get snippetInputs() {
    return this.annotationForm.get('snippetInputs') as FormArray;
  }

  /**
   * Add a text input in the annotation form for each snippet.
   * The 1st snippet is associated with the 1st FormControl.
   * The inputs are initialized with the value of the snippets, in case there is already a transcription for them (produced by a recognizer)
   */
  fillAnnotationForm() {
    this.snippets.forEach(snippet => {
      this.snippetInputs.push(
        this.fb.control(snippet.value, Validators.required)
      );
    });
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
    this.snippetInputs.clear();
    this.updateFlagsUnreadableDB();
    this.updateSnippetsDB();
    this.retrieveSnippetsDB(this.NB_OF_SNIPPETS);
  }

  /* ===== DYNAMIC INTERACTIONS ===== */

  getFocus() {
    document.getElementById(String (Number (String (document.activeElement.id)) + 1)).focus();
  }

  changeFocus() {
    this.getFocus();
  }

  /**
   * Sets current snippet as unreadable. Removes all validators from the associated input field.
   *
   * @param id of the unreadable snippet
   */
  unreadable(id: number) {
    this.snippets[id].unreadable = true;
    this.snippetInputs.at(id).setValidators(null);
    this.snippetInputs.at(id).updateValueAndValidity();
  }

  /* ===== HTTP REQUESTS ===== */

  /**
   * Retrieves a given number of snippets from the database. Expected format:
   * [ { id: int, url: string, value: string}, ... ]
   * where url is the url of the image and value is its transcription (if one exists, empty otherwise)
   *
   * @param nbOfSnippets we want to retrieve
   */
  retrieveSnippetsDB(nbOfSnippets: number) {
    this.http.get<Snippet[]>(`db/retrieve/snippets/${nbOfSnippets}`)
      // Handle HTTP error: 1st param = name of the function that might fail, 2nd param = default value returned in case of error
      .pipe(
        catchError(this.handleError('retrieveSnippetsDB', []))
      )
      // Function handling the result of the HTTP request. Returned value might either be the wanted one or the default one specified above
      .subscribe(returnedData => {
        this.snippets = returnedData;
        this.fillAnnotationForm();
      });
  }

  /**
   * Send all the annotated snippets to the database. Called after annotating all the snippets (once their transcription is correct).
   * Format of the data sent:
   * [ { id: int, value: string}, ...]
   */
  updateSnippetsDB() {
    const updatedSnippets = this.snippets.map(snippet => getIdAndValue(snippet));
    this.http.put('db/update/value', updatedSnippets, {})
      .pipe(
        catchError(this.handleError('updateSnippetsDB', undefined))
      );
  }

  /**
   * Send an array of all the unreadable snippets to update their flag in the database.
   * Format of the data sent:
   * [ { id: int, flag: "unreadable", value: true }, ...]
   */
  updateFlagsUnreadableDB() {
    const unreadableSnippets = this.snippets.filter(snippet => snippet.unreadable)
                                            .map(snippet => getUnreadableFlag(snippet));
    this.snippets = this.snippets.filter(snippet => !snippet.unreadable);
    this.http.put('db/update/flags', unreadableSnippets, {})
      .pipe(
        catchError(this.handleError('updateFlagsUnreadableDB', undefined))
      );
  }

}

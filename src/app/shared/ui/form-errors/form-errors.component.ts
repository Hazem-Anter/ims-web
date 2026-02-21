import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ValidationErrors } from '@angular/forms';

type ErrorMap = Record<string, string>;

@Component({
  selector: 'app-form-errors',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-errors" *ngIf="visible()">
      <div *ngFor="let err of messages()">{{ err }}</div>
    </div>
  `,
  styleUrl: './form-errors.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormErrorsComponent {
  @Input() control?: AbstractControl | null;
  @Input() label = 'Field';
  @Input() customMessages: ErrorMap = {};

  visible = computed(() => !!this.control && this.control.invalid && (this.control.dirty || this.control.touched));
  messages = computed(() => this.collectMessages(this.control?.errors));

  private collectMessages(errors: ValidationErrors | null | undefined): string[] {
    if (!errors) return [];
    const result: string[] = [];
    for (const [key, value] of Object.entries(errors)) {
      const custom = this.customMessages[key];
      if (custom) {
        result.push(custom);
        continue;
      }
      switch (key) {
        case 'required':
          result.push(`${this.label} is required.`);
          break;
        case 'email':
          result.push('Enter a valid email address.');
          break;
        case 'minlength':
          result.push(`${this.label} must be at least ${(value as { requiredLength: number }).requiredLength} characters.`);
          break;
        case 'maxlength':
          result.push(`${this.label} must be at most ${(value as { requiredLength: number }).requiredLength} characters.`);
          break;
        case 'min':
          result.push(`${this.label} must be at least ${(value as { min: number }).min}.`);
          break;
        case 'max':
          result.push(`${this.label} must be at most ${(value as { max: number }).max}.`);
          break;
        default:
          result.push(this.customMessages[key] || 'Invalid value.');
          break;
      }
    }
    return result;
  }
}
